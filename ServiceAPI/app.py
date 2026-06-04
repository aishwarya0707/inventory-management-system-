import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from models import db, Product, Customer, Order

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL', 
    'postgresql://postgres:postgres@localhost:5432/inventory_db'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "inventory-core"}), 200

# ==========================================
# PRODUCT ENDPOINTS (WITH STRICT VALIDATION)
# ==========================================

@app.route('/products', methods=['POST'])
def create_product():
    data = request.json or {}
    
    # 1. Presence Validation
    required = ['sku', 'name', 'price', 'stock']
    if not all(field in data for field in required):
        return jsonify({"error": "Missing required fields: sku, name, price, stock"}), 400

    # 2. Value Range Validation (Prevents negative inputs)
    try:
        price = float(data['price'])
        stock = int(data['stock'])
        if price < 0 or stock < 0:
            return jsonify({"error": "Price and stock quantities cannot be negative values"}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid numeric formatting for price or stock attributes"}), 422

    # 3. Database Uniqueness Validation
    existing_sku = Product.query.filter_by(sku=str(data['sku']).strip()).first()
    if existing_sku:
        return jsonify({"error": f"Product SKU code '{data['sku']}' already exists in registry"}), 409

    try:
        new_product = Product(
            sku=str(data['sku']).strip(),
            name=str(data['name']).strip(),
            price=price,
            stock=stock
        )
        db.session.add(new_product)
        db.session.commit()
        return jsonify({"message": "Product registered successfully", "id": new_product.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Internal database failure: {str(e)}"}), 500

@app.route('/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify([
        {"id": p.id, "sku": p.sku, "name": p.name, "price": p.price, "stock": p.stock} 
        for p in products
    ]), 200

@app.route('/products/<int:id>', methods=['GET'])
def get_product(id):
    # Fetch the product or automatically return a 404 if the ID doesn't exist
    product = Product.query.get_or_404(id)
    
    # Serialize the SQLAlchemy object into a JSON response
    return jsonify({
        "id": product.id,
        "sku": product.sku,
        "name": product.name,
        "price": product.price,
        "stock": product.stock
    }), 200

@app.route('/products/<int:id>', methods=['PUT'])
def update_product(id):
    product = Product.query.get_or_404(id)
    data = request.json or {}

    required = ['sku', 'name', 'price', 'stock']
    if not all(field in data for field in required):
        return jsonify({"error": "Missing parameters for update target"}), 400

    try:
        price = float(data['price'])
        stock = int(data['stock'])
        if price < 0 or stock < 0:
            return jsonify({"error": "Price and stock quantities cannot be negative values"}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid numeric formatting variables"}), 422

    # Verify SKU conflict if changing code values
    new_sku = str(data['sku']).strip()
    if product.sku != new_sku:
        conflict = Product.query.filter_by(sku=new_sku).first()
        if conflict:
            return jsonify({"error": "Target SKU configuration matches an existing product profile"}), 409

    try:
        product.sku = new_sku
        product.name = str(data['name']).strip()
        product.price = price
        product.stock = stock
        db.session.commit()
        return jsonify({"message": "Product metadata updated seamlessly"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Database mutation rejection: {str(e)}"}), 500

@app.route('/products/<int:id>', methods=['DELETE'])
def delete_product(id):
    product = Product.query.get_or_404(id)
    
    # 1. NEW BUSINESS LOGIC CHECK: Are there orders tied to this product?
    if product.orders:
        return jsonify({
            "error": f"Cannot delete '{product.name}' because it is tied to {len(product.orders)} existing order(s). Please void those orders first."
        }), 409 # 409 Conflict status code

    try:
        # 2. If no orders exist, safe to delete
        db.session.delete(product)
        db.session.commit()
        return jsonify({"message": "Product deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500

# ==========================================
# CUSTOMER ENDPOINTS (WITH STRICT VALIDATION)
# ==========================================

@app.route('/customers', methods=['POST'])
def create_customer():
    data = request.json or {}
    
    if not data.get('name') or not data.get('email') or not data.get('phone'):
        return jsonify({"error": "Name, email, and phone contact vectors are mandatory parameters"}), 400
        
    email_clean = str(data['email']).strip().lower()
    existing = Customer.query.filter_by(email=email_clean).first()
    if existing:
        return jsonify({"error": f"Account with email address '{email_clean}' is already registered"}), 409

    try:
        new_customer = Customer(
            name=str(data['name']).strip(),
            email=email_clean,
            phone=str(data['phone']).strip(),
            address=data.get('address', '').strip(),
            status=data.get('status', 'Active')
        )
        db.session.add(new_customer)
        db.session.commit()
        return jsonify({"message": "Customer account created successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Database schema failure: {str(e)}"}), 500

@app.route('/customers', methods=['GET'])
def get_customers():
    customers = Customer.query.all()
    return jsonify([{
        "id": c.id, "name": c.name, "email": c.email, 
        "phone": c.phone, "address": c.address, "status": c.status
    } for c in customers]), 200

@app.route('/customers/<int:id>', methods=['GET'])
def get_customer(id):
    customer = Customer.query.get_or_404(id)
    
    return jsonify({
        "id": customer.id,
        "name": customer.name,
        "email": customer.email,
        "phone": customer.phone,
        "address": customer.address,
        "status": customer.status
    }), 200

@app.route('/customers/<int:id>', methods=['DELETE'])
def delete_customer(id):
    customer = Customer.query.get_or_404(id)
    
    if customer.orders:
        return jsonify({
            "error": f"Cannot delete client '{customer.name}' because their account is tied to {len(customer.orders)} active order(s). Please void those transactions first."
        }), 409

    try:
        db.session.delete(customer)
        db.session.commit()
        return jsonify({"message": "Customer record deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Execution halted: {str(e)}"}), 500
    
# ==========================================
# ORDER ENDPOINTS
# ==========================================

@app.route('/orders', methods=['POST'])
def create_order():
    data = request.json or {}
    
    if not data.get('customer_id') or not data.get('product_id') or not data.get('quantity'):
        return jsonify({"error": "Incomplete order processing structure payload"}), 400

    try:
        quantity = int(data['quantity'])
        if quantity <= 0:
            return jsonify({"error": "Order request quantity parameter must exceed zero units"}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "Quantity variable must be a valid integer signature"}), 422

    product = Product.query.get(data['product_id'])
    customer = Customer.query.get(data['customer_id'])

    if not product:
        return jsonify({"error": "Target processing product profile not found"}), 404
    if not customer:
        return jsonify({"error": "Target processing customer profile not found"}), 404

    if product.stock < quantity:
        return jsonify({"error": f"Transaction denied: Insufficient stock. Only {product.stock} units remain."}), 400

    try:
        product.stock -= quantity
        calculated_total = product.price * quantity

        new_order = Order(
            customer_id=customer.id,
            product_id=product.id,
            quantity=quantity,
            total_amount=calculated_total
        )
        db.session.add(new_order)
        db.session.commit()
        return jsonify({"message": "Order invoice cleared and generated", "order_id": new_order.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Transaction processing failure: {str(e)}"}), 500

@app.route('/orders', methods=['GET'])
def get_orders():
    orders = Order.query.all()
    return jsonify([{
        "id": o.id, "customer_name": o.customer.name, 
        "product_name": o.product.name, "quantity": o.quantity, "total_amount": o.total_amount
    } for o in orders]), 200

@app.route('/orders/<int:id>', methods=['GET'])
def get_order(id):
    order = Order.query.get_or_404(id)
    return jsonify({
        "id": order.id,
        "customer_id": order.customer_id,
        "customer_name": order.customer.name, 
        "product_id": order.product_id,
        "product_name": order.product.name,  
        "quantity": order.quantity,
        "total_amount": order.total_amount
    }), 200

@app.route('/orders/<int:id>', methods=['DELETE'])
def cancel_order(id):
    order = Order.query.get_or_404(id)
    product = Product.query.get(order.product_id)
    try:
        if product:
            product.stock += order.quantity # Automatic stock replenishment on delete
        db.session.delete(order)
        db.session.commit()
        return jsonify({"message": "Order cancellation finalized; inventory restored"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Database reversal exception: {str(e)}"}), 500

# ==========================================
# ANALYTICS & MONITORING SUMMARY ENDPOINTS
# ==========================================

@app.route('/dashboard/summary', methods=['GET'])
def get_dashboard_summary():
    try:
        total_products = Product.query.count()
        total_customers = Customer.query.count()
        total_orders = Order.query.count()
        low_stock_items = Product.query.filter(Product.stock < 10).all()
        
        return jsonify({
            "totals": {
                "products": total_products,
                "customers": total_customers,
                "orders": total_orders,
                "lowStockCount": len(low_stock_items)
            },
            "lowStockProducts": [
                {"id": p.id, "sku": p.sku, "name": p.name, "price": p.price, "stock": p.stock} 
                for p in low_stock_items
            ]
        }), 200
    except Exception as e:
        return jsonify({"error": f"Failed to gather aggregate summary records: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)