# -*- coding: utf-8 -*-

"""Api Controller"""
import json
from time import sleep
from bson import json_util, ObjectId
import datetime

from tg import expose, flash, require, url, lurl, response
from tg import request, redirect, tmpl_context
from tg.i18n import ugettext as _, lazy_ugettext as l_
from tg.exceptions import HTTPFound
from tg import predicates
from tg.jsonify import JSONEncoder
from spacewebapp.controllers.secure import SecureController
from tgext.admin.mongo import BootstrapTGMongoAdminConfig as TGAdminConfig
from tgext.admin.controller import AdminController

from spacewebapp.lib.base import BaseController
from spacewebapp.controllers.error import ErrorController
from spacewebapp.model import Node, DBSession

__all__ = ['RootController']


class ApiController(BaseController):
    def to_json(self, obj):
        print "oggetto:", obj
        return {
            '_id': str(obj.get('_id')),
            'name': obj.get('name'),
            'data_json': obj.get('data_json'),
            'lat': str(obj.get('lat')),
            'lng': str(obj.get('lng')),
            'status': obj.get('status'),
            'update_time': obj.get('update_time'),
            'accelerometer_x': obj.get('accelerometer_x'),
            'accelerometer_y': obj.get('accelerometer_y'),
            'tdr': obj.get('tdr'),
            'tilt': obj.get('tilt'),
            'temp': obj.get('temp')
        }

    @expose(content_type='text/event-stream')
    def get_all_data_event(self, **kw):

        response.headers["Access-Control-Allow-Origin"] = "*"
        """This method showcases how you can use the same controller for a data page and a display page"""

        def _generator():
            while True:
                from pymongo import MongoClient
                from tg import config
                client = MongoClient("%s%s" % (config.get('ming.url'), config.get('ming.db')))
                db = client.spacehackaton
                '''
                data_to_deactivate = db.node.find(
                    {
                        'update_time': {
                            '$lt': datetime.datetime.utcnow()-datetime.timedelta(seconds=10)
                        }
                    }
                )

                for item_to_deactivate in data_to_deactivate:
                    db.node.update({'name': item_to_deactivate.get('name')}, {'$set': {'status': 'INACTIVE'}})
                '''
                data_to_return = db.node.find()
                json_data = json.dumps([self.to_json(x) for x in data_to_return], sort_keys=True, indent=4,
                                       default=json_util.default)
                event = "data: %s\n\n" % json.loads(json_data)
                sleep(1)
                #print "Nodes", event.replace("u'", "'").replace("'", "\"")
                client.close()
                yield event.replace("u'", "'").replace("'", "\"").encode('utf-8')

        return _generator()

    @expose('json')
    def get_all_data_no_event(self):
        data_to_return = Node.query.find().all()
        return dict(data=data_to_return)

    @expose('json')
    def get_node_data(self, name, lat, lng):
        node = Node.query.find({"name": name}).first()
        #print "Nodo:", node
        return dict(node_data=node)


    @expose('json')
    def new_or_update_device(self, latitude, longitude, status, accelerometer_x, accelerometer_y, tdr, tilt, name,
                             temperature, **kw):
        node = Node.query.find({"name": name}).first()
        print "temperatura:", temperature
        if node is None:
            Node(
                name=name,
                data_json=kw,
                lat=float(latitude),
                lng=float(longitude),
                status=status,
                accelerometer_x=float(accelerometer_x),
                accelerometer_y=float(accelerometer_y),
                tdr=float(tdr),
                tilt=float(tilt),
                update_time=datetime.datetime.utcnow(),
                temp=float(temperature)
            )
        else:
            node.data_json = kw
            node.lat = float(latitude)
            node.lng = float(longitude)
            node.status = status
            node.accelerometer_x = float(accelerometer_x)
            node.accelerometer_y = float(accelerometer_y)
            node.tdr = float(tdr)
            node.tilt = float(tilt)
            node.update_time = datetime.datetime.utcnow()
            node.temp = float(temperature)

        DBSession.flush()

        return dict(result='success')


    @expose('json')
    def update_status(self, name, status, **kw):
        node = Node.query.find({"name": name}).first()
        if node is None:
            return dict(result='error')
        node.status = status
        return dict(result='success')