--- load with 
--- sqlite3 database.db < schema.sql
PRAGMA foreign_keys = ON;
drop table user;
drop table achievement;
create table user(
	userid varchar(50) primary key,
	username varchar(50) not null,
	password varBINARY(64) not null,
	salt varbinary(64) not null,

	gender varchar(10) not null default 'male',
	birthday date not null default CURRENT_DATE,
	creattime timestamp(0) default current_timestamp
);

create table achievement (
  userid varchar(50) primary key,
  kill int default 0 not null,
  damage int default 0 not  null,
  FOREIGN KEY(userid)  references user(userid) ON DELETE CASCADE
);

