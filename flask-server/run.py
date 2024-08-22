from server import app, db

if __name__ == '__main__':
    # I need server prefix because react client has own routes.
    with app.app_context():
        db.create_all()
        db.session.commit()
    app.run(debug=True)