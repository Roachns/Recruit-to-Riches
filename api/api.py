#----------------------------
# IMPORTS
#----------------------------
from flask import Flask, request, jsonify

import pandas as pd
import numpy as np

import sqlalchemy
from sqlalchemy import create_engine

#----------------------------
# SQLALCHEMY SETUP
#----------------------------
engine = create_engine('sqlite:///../data/football_new.db')

#----------------------------
# Create dataframes
#----------------------------
drafted = pd.read_sql_table('drafted_recruits', engine)
recruits = pd.read_sql_table('cfb_recruits', engine)

#----------------------------
# Build data
#----------------------------
def heatmap_data():
    star_rnd = drafted[['STAR','DRAFT_RND']]
    crosstab = pd.crosstab(star_rnd['DRAFT_RND'], star_rnd['STAR'])

    z = [[0,0,0,0,0,0,0]]
    for i in range(4):
        col = i+2
        item = crosstab[col].tolist()
        z.append(item)

    x = ['Rnd 1', 'Rnd 2', 'Rnd 3', 'Rnd 4', 'Rnd 5', 'Rnd 6', 'Rnd 7']
    y = ['1 Star','2 Star','3 Star','4 Star','5 Star']

    data = [{'z':z, 'x':x, 'y':y, 'type':'heatmap'}]
    return data


#----------------------------
# Create JSON variables
#----------------------------
heatmap = heatmap_data()



#----------------------------
# BUILD FLASK ROUTES
#----------------------------
app = Flask(__name__)

@app.route('/')
def home():
    return "Main page goes here"


@app.route('/draft/rnd/')
def draft_round():
    '''
    Returns a list with single dict containing z,x,y for heatmap
    '''
    return jsonify(heatmap)


@app.route('/draft/ratio/')
def draft_ratio():


if __name__ == '__main__':
    #app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.run(debug=True)