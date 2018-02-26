#----------------------------
# IMPORTS
#----------------------------
from flask import Flask, request

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