from sqlalchemy import Column, Integer, String, Boolean, Date, Float
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()
def printRow(self):
    elems = dict()
    for key in set(dir(self.__class__)) - set(dir(Base)):
        if key in self.__dict__: elems[key] = self.__dict__[key]
    return '%s' % elems
Base.__repr__ = printRow
Base.__str__ = printRow

class LinkedSerivce(Base):
    __tablename__ = 'LinkedServices'
    id = Column(Integer, primary_key=True)
    token = Column(String)
    service = Column('service_id', String)
    #createdAt = Column(Date)
    #updatedAt = Column(Date)
    #deletedAt = Column(Date)
    userId = Column('UserId', Integer)

class PositionSkill(Base):
    __tablename__ = 'Position_Skills'
    id = Column(Integer, primary_key=True)
    weight = Column(Float)
    #createdAt = Column(Date)
    #updatedAt = Column(Date)
    #deletedAt = Column(Date)
    positionId = Column('PositionId', Integer)
    skillId = Column('SkillId', Integer)

class Position(Base):
    __tablename__ = 'Positions'
    id = Column(Integer, primary_key=True)
    name = Column(String)
    hours = Column(Integer)
    budget = Column(Float)
    #createdAt = Column(Date)
    #updatedAt = Column(Date)
    #deletedAt = Column(Date)
    userId = Column('UserId', Integer)
    projectId = Column('ProjectId', Integer)
    type = Column(String)
    status = Column(String)
    matchScore = Column(Float)

class Project(Base):
    __tablename__ = 'Projects'
    id = Column(Integer, primary_key=True)
    name = Column(String)
    #shortDescription = Column('short_description', String)
    #privateDescription = Column('private_description', String)
    budget = Column(Float)
    #createdAt = Column(Date)
    #updatedAt = Column(Date)
    #deletedAt = Column(Date)
    status = Column(String)
    userId = Column('UserId', Integer)

class Rating(Base):
    __tablename__ = 'Ratings'
    id = Column(Integer, primary_key=True)
    rating = Column(Float)
    #feedback = Column(String)
    #createdAt = Column(Date)
    #updatedAt = Column(Date)
    #deletedAt = Column(Date)
    positionId = Column('PositionId', Integer)
    userId = Column('UserId', Integer)

class Skill(Base):
    __tablename__ = 'Skills'
    id = Column(Integer, primary_key=True)
    name = Column(String)
    #createdAt = Column(Date)
    #updatedAt = Column(Date)
    #deletedAt = Column(Date)
    parentSkillId = Column('parent_Skill_id', Integer)

class UserSkill(Base):
    __tablename__ = 'User_Skills'
    id = Column(Integer, primary_key=True)
    weight = Column(Float)
    #createdAt = Column(Date)
    #updatedAt = Column(Date)
    #deletedAt = Column(Date)
    skillId = Column('SkillId', Integer)
    userId = Column('UserId', Integer)

class User(Base):
    __tablename__ = 'Users'
    id = Column(Integer, primary_key=True)
    firstName = Column('first_name', String)
    lastName = Column('last_name', String)
    #passwordhash = Column(String)
    #avatar = Column(String)
    email = Column(String)
    admin = Column(Boolean)
    owner = Column(Boolean)
    designer = Column(Boolean)
    developer = Column(Boolean)
    #createdAt = Column(Date)
    #updatedAt = Column(Date)
    deletedAt = Column(Date)


