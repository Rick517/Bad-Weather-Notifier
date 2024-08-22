from server import db
import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(40), unique=True, nullable=False)

    schedules = db.relationship('Schedules', back_populates='user', 
                                lazy=True, cascade="all, delete")

    __table_args__ = (
        db.Index('ix_email', 'email'),
    )

    @staticmethod
    def is_registered(email):
        # Returns user or None
        return User.query.filter_by(email=email).first()

class Schedules(db.Model):
    id = db.Column(db.String(32), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete="CASCADE"), nullable=False)
    days = db.Column(db.Integer, nullable=False)
    notifying_time = db.Column(db.String(5), nullable=False)
    forecasting_time = db.Column(db.String(5), nullable=False)
    email = db.Column(db.String(40), nullable=False)
    date = db.Column(db.DateTime, nullable=False, default=datetime.datetime.now())
    lat = db.Column(db.String(10), nullable=False)
    lon = db.Column(db.String(10), nullable=False)

    user = db.relationship('User', back_populates='schedules', 
                           lazy=True, passive_deletes=True)

    __table_args__ = (
        db.Index('ix_schedule_id', 'user_id'),
    )
