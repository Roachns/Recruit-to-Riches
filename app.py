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
engine = create_engine('sqlite:///data/football_new.db')


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
    draft_size = df_join['DRAFTED'].tolist()
    recruit_size = df_join['RECRUITED'].tolist()
    marker_size = [i * 200 for i in df_join['DRAFTED'].tolist()]

    labels = []
    for i in range(len(df_join['DRAFTED'].tolist())):
        labels.append(f'Drafted: {draft_size[i]} <br>Recruited: {recruit_size[i]}')

    trace = {
        'x': x,
        'y': y,
        'text': labels,
        'marker': {
            'size': marker_size,
            'sizemode': 'area',
            'color': 'green'
            }
    }

    return trace



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
    return jsonify(heatmap_data())


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


@app.route("/plot1")
def recruitStatesBar():
    df = recruits

    df0=df.groupby(['STATE', 'STAR'])['PLAYER'].count()
    df0=df0.to_frame()
    df0=df0.reset_index()
    df0=df0.pivot(index='STATE', columns='STAR', values='PLAYER')

    df0['sum'] = df0[list(df0.columns)].sum(axis=1)
    df0.sort_values('sum', ascending=True, inplace=True)
    df0.drop('sum', axis=1, inplace=True)
    df0 = df0.fillna(0)
    df0=df0.reset_index()

    traces=[]
    for i in range(1,6):
        trace = {
            'y': df0.STATE.tolist(), # States 
            'x': df0.iloc[:,i].tolist(), #Star
            'name': i,
            'orientation': 'h',
            'type': 'bar'
            
        }
        traces.append(trace)

    return jsonify(traces)


@app.route("/plot2")
def recruitMap():
    df = recruits

    lats=df.LAT.tolist()
    lngs=df.LNG.tolist()
    cords = [[lats[i], lngs[i]] for i in range(len(lats))]
    return jsonify(cords)


@app.route("/plot3")
def draftPie():
    All = int(recruits.PLAYER.count()) 
    draft = int(drafted.PLAYER.count())
    notDraf = All - draft

    trace = [
        {
        'values': [draft, notDraf],
        'labels': ['Drafted', 'Not Drafted'],
        'type': 'pie'
        }
    ]
    return jsonify(trace)


@app.route("/plot4")
def draftStackedBar():

    cfb_recruits = recruits

    allPLAYER = cfb_recruits['PLAYER'].value_counts() < 2
    allPLAYER = allPLAYER.to_frame()
    allPLAYER =  allPLAYER [allPLAYER['PLAYER'] == True]

    cr1 = cfb_recruits['PLAYER'].isin(allPLAYER.index.tolist())
    cfb_recruits = cfb_recruits[cr1]

    drafted_recruits = drafted
    drafted_recruits['DRAFTED'] = 1
    drafted_recruits = drafted_recruits[['PLAYER', 'DRAFTED']]

    df3=pd.merge(cfb_recruits, drafted_recruits, on = 'PLAYER', how='left').fillna(0)

    count0=df3.groupby('STAR')['PLAYER'].count()
    count1=df3.groupby(['STAR', 'DRAFTED'])['PLAYER'].count()
    countPerC = round(count1/count0*100, 0)
    countPerC = countPerC.reset_index()
    countPerC.loc[-1] = [1, 1, 0.0]
    countPerC = countPerC.sort_values(['STAR', 'DRAFTED']).reset_index().drop('index', axis=1)

    df0=countPerC.pivot(index='STAR', columns='DRAFTED', values='PLAYER').reset_index().astype(int)
    df0.columns = ['STAR', 'Not Drafted', 'Drafted']

    traces=[]
    for i in range(1,3):
        if i == 1:
            name = 'Not Drafted'
        else:
            name = 'Drafted'
            
        trace = {
            'x': df0.STAR.tolist(), # States 
            'y': df0.iloc[:,i].tolist(), #Star
            'name': name,
            'type': 'bar'
        }
        traces.append(trace)

    return jsonify(traces)


if __name__ == '__main__':
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.run(debug=True)