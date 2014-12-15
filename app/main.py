from __future__ import (absolute_import, division, print_function,
        unicode_literals)

from builtins import (ascii, bytes, chr, dict, filter, hex, input, range, str,
        super, zip)

from collections import namedtuple
from enum import IntEnum

from flask import Flask, redirect, render_template, request, url_for
from flask.ext.sqlalchemy import SQLAlchemy


IMG_PATH_EMPTY = '/static/images/goban/e.gif'
IMG_PATH_BLACK = '/static/images/goban/b.gif'
IMG_PATH_WHITE = '/static/images/goban/w.gif'

app = Flask(__name__)
app.config.from_object('config')
db = SQLAlchemy(app)

@app.route('/game')
def game():
    moves = Move.query.all()
    stone = get_stone_if_args_good(args=request.args, moves=moves)
    if stone is not None:
        db.session.add(stone)
        db.session.commit()
    moves = Move.query.all()
    goban = get_img_array_from_moves(moves)
    return render_template("game.html", move_no=len(moves), goban=goban)

@app.route('/newgame')
def newgame():
    db.session.add(Game())
    db.session.commit()
    return redirect(url_for('listgames'))

@app.route('/listgames')
def listgames():
    games = Game.query.all()
    return render_template("listgames.html", games=games)


def get_stone_if_args_good(args, moves):
    try:
        move_no = int(args['move_no'])
        row = int(args['row'])
        column = int(args['column'])
    except (KeyError, ValueError):
        return None
    if move_no != len(moves):
        return None
    color = (Move.Color.black, Move.Color.white)[move_no % 2]
    return Move(move_no=move_no, row=row, column=column, color=color)

def get_img_array_from_moves(moves):
    goban = [[IMG_PATH_EMPTY for j in range(19)]
            for i in range(19)]
    for move in moves:
        if move.color == Move.Color.black:
            goban[move.row][move.column] = IMG_PATH_BLACK
        elif move.color == Move.Color.white:
            goban[move.row][move.column] = IMG_PATH_WHITE
    return goban


class Game(db.Model):
    id = db.Column(db.Integer, primary_key=True)

class Move(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    row = db.Column(db.Integer)
    column = db.Column(db.Integer)
    move_no = db.Column(db.Integer)
    
    class Color(IntEnum):
        black = 0
        white = 1
    color = db.Column(db.Integer)

    def __init__(self, move_no, row, column, color):
        self.move_no = move_no
        self.row = row
        self.column = column
        self.color = color

    def __repr__(self):
        return '<Move {0}: {1} at ({2},{3})>'.format(
                self.move_no, Color(self.color).name,
                self.column, self.row)