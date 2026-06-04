from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sku = db.Column(db.String(50), unique=True, nullable=False) # Enforces unique SKU requirement
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, nullable=False)

class Customer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False) # Enforces unique email requirement
    phone = db.Column(db.String(20), nullable=False)
    address = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(20), default="Active")

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    total_amount = db.Column(db.Float, nullable=False)

    customer = db.relationship('Customer', backref=db.backref('orders', lazy=True))
    product = db.relationship('Product', backref=db.backref('orders', lazy=True))