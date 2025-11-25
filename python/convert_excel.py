"""
Excel to JSON Converter for Dropee Order Data
Merges all sheets and outputs structured JSON for the React dashboard.
"""

import pandas as pd
import json
from pathlib import Path

# Configuration
EXCEL_FILE = Path(__file__).parent.parent.parent / 'List Excel Dropee_Amin Edit.xlsx'
OUTPUT_DIR = Path(__file__).parent.parent / 'public' / 'data'

# Sheets containing order data
DATA_SHEETS = ['1-2000', '2001-4000', '4001-6000', '6001-8000',
               '8001-9000', '9001-10000', '10001-11000']

# Column mapping from various names to standard names
COLUMN_VARIANTS = {
    'orderNo': ['Order No', 'Order No.', 'OrderNo', 'Supplier Order No'],
    'orderDate': ['Order Date', 'OrderDate'],
    'orderTotal': ['Order Total (RM)', 'Order Total', 'OrderTotal'],
    'customerName': ['Order By', 'OrderBy', 'Customer'],
    'email': ['Email', 'E-mail'],
    'mobileNo': ['Mobile No', 'Mobile No.', 'Phone', 'MobileNo'],
    'shipTo': ['Ship To', 'ShipTo', 'Address'],
    'state': ['State'],
    'itemName': ['Item Name', 'ItemName', 'Product'],
    'itemBrand': ['Item Brand', 'ItemBrand', 'Brand']
}

def find_column(df_columns, variants):
    """Find the first matching column from variants"""
    for var in variants:
        if var in df_columns:
            return var
    return None

def normalize_sheet(df):
    """Normalize a single sheet's columns to standard names"""
    df.columns = df.columns.str.strip()

    result = pd.DataFrame()
    for standard_name, variants in COLUMN_VARIANTS.items():
        col = find_column(df.columns, variants)
        if col:
            result[standard_name] = df[col]
        else:
            result[standard_name] = None

    return result

def load_and_merge_sheets(excel_path):
    """Load all data sheets, normalize, and merge into single DataFrame"""
    print(f"Loading Excel file: {excel_path}")

    all_dfs = []
    xl = pd.ExcelFile(excel_path)

    for sheet in DATA_SHEETS:
        if sheet in xl.sheet_names:
            print(f"  Loading sheet: {sheet}")
            df = pd.read_excel(xl, sheet_name=sheet)

            # Normalize columns
            normalized = normalize_sheet(df)

            # Track source sheet
            normalized['sourceSheet'] = sheet

            # Count valid records
            valid_count = normalized['orderNo'].notna().sum()
            print(f"    Valid records: {valid_count}")

            all_dfs.append(normalized)
        else:
            print(f"  Sheet '{sheet}' not found, skipping...")

    merged = pd.concat(all_dfs, ignore_index=True)
    print(f"Total records loaded: {len(merged)}")
    return merged

def clean_data(df):
    """Clean and normalize data"""
    print("Cleaning data...")

    # Remove rows without order number
    df = df[df['orderNo'].notna()].copy()
    print(f"  After removing null orders: {len(df)}")

    # Clean state names
    df['state'] = df['state'].astype(str).str.strip().str.upper()
    df['state'] = df['state'].replace({
        'WILAYAH PERSEKUTUAN': 'KUALA LUMPUR',
        'W.P. KUALA LUMPUR': 'KUALA LUMPUR',
        'PULAU PINANG': 'PENANG',
        'NAN': None,
        'NONE': None,
        'NAT': None,
        '': None
    })
    df.loc[df['state'].str.contains('NAN|NONE|NAT', na=False, case=False), 'state'] = None

    # Parse dates
    df['orderDate'] = pd.to_datetime(df['orderDate'], errors='coerce', format='mixed')
    df['orderDateISO'] = df['orderDate'].dt.strftime('%Y-%m-%d')
    df['orderYear'] = df['orderDate'].dt.year.astype('Int64')
    df['orderMonth'] = df['orderDate'].dt.month.astype('Int64')

    # Clean order totals
    df['orderTotal'] = pd.to_numeric(
        df['orderTotal'].astype(str).str.replace(',', '').str.replace('RM', '').str.strip(),
        errors='coerce'
    ).fillna(0)

    # Clean text fields
    for col in ['itemName', 'itemBrand', 'customerName', 'email', 'shipTo', 'mobileNo']:
        df[col] = df[col].astype(str).str.strip()
        df[col] = df[col].replace({'nan': None, 'None': None, 'NaN': None, '': None})

    # Clean item brand (remove leading dashes and extra spacing)
    df['itemBrand'] = df['itemBrand'].str.lstrip('-').str.strip()

    # Generate unique ID
    df['id'] = range(1, len(df) + 1)

    print(f"Records after cleaning: {len(df)}")
    return df

def generate_metadata(df):
    """Generate metadata for filters and analytics"""
    print("Generating metadata...")

    # Get unique orders and total revenue
    unique_orders = df['orderNo'].nunique()
    order_totals = df.groupby('orderNo')['orderTotal'].first()
    total_revenue = order_totals.sum()

    # Get unique states and brands
    states = sorted([s for s in df['state'].dropna().unique().tolist()
                    if s and s not in ['NAN', 'NONE', 'NAT', '']])

    brands = df['itemBrand'].dropna().unique().tolist()
    brands = sorted([b for b in brands if b and b not in ['nan', 'None', '', '-']])

    # Date range
    valid_dates = df['orderDateISO'].dropna()

    metadata = {
        'totalOrders': int(unique_orders),
        'totalRecords': len(df),
        'totalRevenue': float(total_revenue) if pd.notna(total_revenue) else 0,
        'dateRange': {
            'min': str(valid_dates.min()) if len(valid_dates) > 0 else None,
            'max': str(valid_dates.max()) if len(valid_dates) > 0 else None
        },
        'states': states,
        'brands': brands[:500],
        'uniqueCustomers': int(df['customerName'].nunique()),
        'uniqueItems': int(df['itemName'].nunique())
    }

    print(f"  Total unique orders: {metadata['totalOrders']}")
    print(f"  Total revenue: RM {metadata['totalRevenue']:,.2f}")
    print(f"  States: {len(metadata['states'])}")
    print(f"  Brands: {len(metadata['brands'])}")
    print(f"  Unique customers: {metadata['uniqueCustomers']}")
    print(f"  Unique items: {metadata['uniqueItems']}")

    return metadata

def prepare_export_data(df):
    """Prepare data for JSON export"""
    records = []

    for _, row in df.iterrows():
        record = {
            'id': int(row['id']),
            'orderNo': str(int(row['orderNo'])) if pd.notna(row['orderNo']) else None,
            'orderDate': str(row['orderDateISO']) if pd.notna(row['orderDateISO']) and row['orderDateISO'] != 'NaT' else None,
            'orderYear': int(row['orderYear']) if pd.notna(row['orderYear']) else None,
            'orderMonth': int(row['orderMonth']) if pd.notna(row['orderMonth']) else None,
            'orderTotal': float(row['orderTotal']) if pd.notna(row['orderTotal']) else 0,
            'customerName': row['customerName'] if row['customerName'] else None,
            'email': row['email'] if row['email'] else None,
            'mobileNo': row['mobileNo'] if row['mobileNo'] else None,
            'shipTo': row['shipTo'] if row['shipTo'] else None,
            'state': row['state'] if row['state'] else None,
            'itemName': row['itemName'] if row['itemName'] else None,
            'itemBrand': row['itemBrand'] if row['itemBrand'] else None
        }
        records.append(record)

    return records

def export_json(records, metadata, output_dir):
    """Export data and metadata to JSON files"""
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    # Export main data
    orders_file = output_path / 'orders.json'
    with open(orders_file, 'w', encoding='utf-8') as f:
        json.dump(records, f, ensure_ascii=False)
    print(f"Exported {len(records)} records to {orders_file}")

    # Export metadata
    metadata_file = output_path / 'metadata.json'
    with open(metadata_file, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    print(f"Exported metadata to {metadata_file}")

def main():
    print("=" * 50)
    print("Dropee Excel to JSON Converter")
    print("=" * 50)

    # Load and merge
    df = load_and_merge_sheets(EXCEL_FILE)

    # Clean
    df = clean_data(df)

    # Generate metadata
    metadata = generate_metadata(df)

    # Prepare records
    print("Preparing export data...")
    records = prepare_export_data(df)

    # Export
    export_json(records, metadata, OUTPUT_DIR)

    print("=" * 50)
    print("Conversion complete!")
    print("=" * 50)

if __name__ == '__main__':
    main()
