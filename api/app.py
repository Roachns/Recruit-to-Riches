#----------------------------
# IMPORTS
#----------------------------
from flask import Flask, request, jsonify, render_template

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

    trace = [{'z':z, 'x':x, 'y':y, 'type':'heatmap', 'colorscale': 'Reds'}]
    return trace


def bubble_data(star):
    star_int = int(star)
    df1 = recruits.loc[recruits['STAR'] == star_int]
    df1 = df1.groupby('COLLEGE').count().sort_values('PLAYER', ascending=False)
    df1 = df1['PLAYER'].to_frame().rename(columns={'PLAYER':'RECRUITED'})

    df2 = drafted.loc[drafted['STAR'] == star_int]
    df2 = df2.groupby('COLLEGE_NFL').count().sort_values('PLAYER', ascending=False)
    df2 = df2['PLAYER'].to_frame()
    df2 = df2.reset_index().rename(columns={'PLAYER':'DRAFTED','COLLEGE_NFL':'COLLEGE'}).set_index('COLLEGE')

    df_join = df2.join(df1, how='outer')
    df_join = df_join.fillna(0).astype(int)
    df_join['RATIO'] = df_join['DRAFTED']/df_join['RECRUITED']
    df_join = df_join.replace([np.inf, -np.inf], np.nan).dropna(how="any")
    df_join = df_join.loc[df_join['RECRUITED'] > 2]
    df_join = df_join.sort_values('RATIO', ascending=False).reset_index().head(20)

    x = df_join['COLLEGE'].tolist()
    y = df_join['RATIO'].tolist()
    draft_amt = df_join['DRAFTED'].tolist()
    marker_size = [i * 200 for i in df_join['DRAFTED'].tolist()]

    trace = {
        'x': x,
        'y': y,
        'text': draft_amt,
        'marker': {
            'size': marker_size,
            'sizemode': 'area',
            'color': 'purple'
            }
    }

    return trace


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
    return render_template('index.html')


@app.route('/draft/rnd/')
def draft_round():
    '''
    Returns a list with single dict containing z,x,y for heatmap
    '''
    return jsonify(heatmap)


@app.route('/draft/ratio/<star>')
def draft_ratio(star):
    '''
    Docstring
    '''
    return jsonify(bubble_data(star))


@app.route('/recruits/waffle')
def waffle_chart():
    data = [
        {'source': 'One-Two star', 'value': 885},
        {'source': 'Three star', 'value': 1279},
        {'source': 'Four star', 'value': 287},
        {'source': 'Five star', 'value': 32},
    ]

    return jsonify(data)


if __name__ == '__main__':
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.run(debug=True)