import csv

# --- Configuration ---
# Change 'second_file.csv' to the actual name of your other CSV file
file_to_filter = 'value.csv'
reference_file = '../Vic_Europe/WW1_Europe.csv' 
output_file = 'filtered_value.csv'

def filter_csv():
    # 1. Store the valid names from the first column of the reference fileaW
    valid_names = set()
    
    try:
        with open(reference_file, mode='r', encoding='utf-8') as ref_csv:
            reader = csv.reader(ref_csv)
            for row in reader:
                if row:  # Make sure the row isn't completely empty
                    # row[0] is the first column. .strip() removes accidental spaces.
                    valid_names.add(row[0].strip().lower())
    except FileNotFoundError:
        print(f"Error: Could not find '{reference_file}'. Please check the file name.")
        return

    # 2. Read value.csv, filter it, and write the matching rows to a new file
    try:
        with open(file_to_filter, mode='r', encoding='utf-8') as val_csv, \
             open(output_file, mode='w', encoding='utf-8', newline='') as out_csv:
            
            reader = csv.reader(val_csv)
            writer = csv.writer(out_csv)
            
            # Read and immediately write the Header row so we don't lose it
            header = next(reader, None)
            if header:
                writer.writerow(header)
                # Ensure the header name itself is in our valid_names set 
                # just in case the reference file didn't have a header
                valid_names.add(header[0].strip()) 

            # Loop through the rest of the rows in value.csv
            kept_rows = 0
            for row in reader:
                row[0] = row[0].lower().capitalize()
                # Check if the first column of this row exists in our valid_names set
                if row and row[0].strip().lower() in valid_names:
                    writer.writerow(row)
                    kept_rows += 1
                    
            print(f"Success! Kept {kept_rows} rows.")
            print(f"Filtered data saved to: {output_file}")
            
    except FileNotFoundError:
        print(f"Error: Could not find '{file_to_filter}'. Did you run the Node.js script first?")

# Run the function
if __name__ == "__main__":
    filter_csv()