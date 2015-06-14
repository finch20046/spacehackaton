import datetime
from ming.odm import FieldProperty
from ming.odm.declarative import MappedClass
from ming import schema as s
from spacewebapp.model import DBSession
from pymongo import GEO2D

__author__ = 'marcellocardea'

class Node(MappedClass):
    """
    User definition.

    This is the user definition used by :mod:`repoze.who`, which requires at
    least the ``user_name`` column.

    """
    class __mongometa__:
        session = DBSession
        name = 'node'

    _id = FieldProperty(s.ObjectId)
    name = FieldProperty(s.String)
    data_json = FieldProperty(s.Anything)
    lat = FieldProperty(s.Float)
    lng = FieldProperty(s.Float)
    status = FieldProperty(s.String, if_missing='active')
    update_time = FieldProperty(s.DateTime, if_missing=datetime.utcnow)
    accelerometer_x = FieldProperty(s.Float)
    accelerometer_y = FieldProperty(s.Float)
    tdr = FieldProperty(s.Float)
    tilt = FieldProperty(s.Float)

    def to_json(self):
        return {
            '_id': str(self._id),
            'name': self.name,
            'data_json' : self.data_json,
            'lat': str(self.lat),
            'lng': str(self.lng),
            'status': self.status
        }