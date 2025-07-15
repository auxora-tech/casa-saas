import psycopg2

# Replace YOUR_PASSWORD with the actual password you set when creating RDS
DB_HOST = "casa-db.cp2qwwo80nb7.ap-southeast-2.rds.amazonaws.com"
DB_NAME = "casa-db"  # Default database name
DB_USER = "Anjumaster123"  # Default username
DB_PASSWORD = "CasaPass#123"  # Replace with your actual password
DB_PORT = 5432
YOUR_IP = '2409: 40c4: 27b: 5862: 8428: d540: a35: 5200'
DB_SG_ID = 'sg-02161243dd1ad4437'

try:
    print("Testing database connection...")
    connection = psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        port=DB_PORT,
        sslmode='require'
    )

    cursor = connection.cursor()
    cursor.execute("SELECT version();")
    record = cursor.fetchone()
    print("✅ SUCCESS: Database connected!")
    print("PostgreSQL version:", record[0])

except Exception as error:
    print("❌ ERROR:", error)

finally:
    if 'connection' in locals():
        cursor.close()
        connection.close()
