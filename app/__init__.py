import os
from flask import Flask
from .config import DevConfig, ProdConfig
from .extensions import db, login_manager


def create_app(config=None):
    app = Flask(__name__,
                static_folder='static',
                template_folder='templates')

    if config is None:
        env = os.environ.get('FLASK_ENV', 'development')
        config = ProdConfig if env == 'production' else DevConfig
    app.config.from_object(config)

    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(os.path.join(app.instance_path), exist_ok=True)

    db.init_app(app)
    login_manager.init_app(app)

    from .routes.public import public_bp
    from .routes.admin import admin_bp
    app.register_blueprint(public_bp)
    app.register_blueprint(admin_bp, url_prefix='/admin')

    with app.app_context():
        db.create_all()

    return app
