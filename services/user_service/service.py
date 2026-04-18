from .db import get_db

# create or update
def create_user(user_id, data):
    conn = get_db()
    cur = conn.cursor()

    cur.execute('''
    INSERT INTO user_service.users (id, name, phone, email,  upi_id)
    VALUES (%s, %s, %s, %s, %s)
    ON CONFLICT (id)
    DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email_id,
        upi_id = EXCLUDED.upi_id
    RETURNING id, name, phone, email, upi_id;
    ''', (user_id, data.name, data.phone, data.email, data.upi_id))

    user = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    return user

# get singleUser
def get_user_by_id(user_id):
    conn = get_db()
    cur = conn.cursor()

    cur.execute('''
    SELECT id, name, phone, email, upi_id
    FROM user_service.users
    WHERE id = %s;
    ''', (user_id,))
    user = cur.fetchone()
    cur.close()
    conn.close()
    return user

# get multiple users
def get_user_by_ids(user_ids):
    conn = get_db()
    cur = conn.cursor()
    cur.execute('''
    SELECT id, name, phone, email, upi_id
    FROM user_service.users
    WHERE id = ANY(%s);
    ''', (user_ids,))

    users = cur.fetchall()
    cur.close()
    conn.close()
    return users