"""Add speaker field to the chat comment database records so that we can display who has said what.

Revision ID: 2dfb5e99f2c
Revises: 1e63b784275
Create Date: 2015-06-24 15:45:05.876800

"""

# revision identifiers, used by Alembic.
revision = '2dfb5e99f2c'
down_revision = '1e63b784275'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.add_column('game_comment', sa.Column('speaker', sa.String(length=254), nullable=True))
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('game_comment', 'speaker')
    ### end Alembic commands ###
