#----------------------------
# IMPORTS
#----------------------------
from flask import Flask, request, jsonify

import pandas as pd

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, inspect

#----------------------------
# SQLALCHEMY SETUP
#----------------------------
engine = create_engine('sqlite:///../data/football.db')

Base = automap_base()
Base.prepare(engine, reflect=True)

cfb_positions = Base.classes.cfb_positions
cfb_recruits = Base.classes.cfb_recruits
nfl_draft = Base.classes.nfl_draft
nfl_positions = Base.classes.nfl_positions
nfl_teams = Base.classes.nfl_teams

session = Session(engine)
inspector = inspect(engine)

#----------------------------
# BUILD FLASK ROUTES
#----------------------------
app = Flask(__name__)

@app.route('/')
def home():
    return "Main page goes here"

@app.route('/recruits/starcount/')
def starcount():
    '''
    Returns dict with two lists.
        STARS: Recruit star ratings
        AVG_YEAR: Average count of recruits for each star rating
    '''

    df = pd.read_sql_table('cfb_recruits', engine)
    df = df.groupby(['STAR']).count().reset_index()
    df['STAR'] = ['One','Two','Three','Four','Five']
    df['PLAYER'] = df['PLAYER'].apply(lambda x: int(round(x*0.17)))
    df = df[['STAR','PLAYER']]
    df = df.rename(columns={'STAR':'STARS','PLAYER':'AVG_YEAR'})

    star_dict = df.to_dict('list')

    return jsonify(star_dict)

@app.route()

if __name__ == '__main__':
    #app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.run(debug=True)