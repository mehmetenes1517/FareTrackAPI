import {open,Database} from "sqlite"
import sqlite3 from "sqlite3"


const main=async()=>{

    let db:Database=await open({
        filename:"main.db",
        driver:sqlite3.Database
    });
    
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users
        (
        id INTEGER NOT NULL PRIMARY KEY,
        username TEXT NOT NULL ,
        password TEXT NOT NULL ,
        email TEXT NOT NULL,
        phone TEXT NOT NULL
        );`);
    
    await db.exec(`
        CREATE TABLE IF NOT EXISTS wallets
        (
        id INTEGER NOT NULL PRIMARY KEY,
        foreign_id INTEGER NOT NULL ,
        amount FLOAT NOT NULL 
        );`);
    await db.exec(`
        CREATE TABLE IF NOT EXISTS drivers
        (
        id INTEGER NOT NULL PRIMARY KEY,
        companyid INTEGER NOT NULL ,
        isactive BIT NOT NULL,
        username TEXT NOT NULL, 
        email TEXT NOT NULL, 
        password TEXT NOT NULL, 
        busid TEXT NOT NULL 
    );`);
    await db.exec(`
        CREATE TABLE IF NOT EXISTS companies
        (
        id INTEGER NOT NULL PRIMARY KEY,
        companyname TEXT NOT NULL ,
        username TEXT NOT NULL, 
        password TEXT NOT NULL, 
        email TEXT NOT NULL, 
        phone TEXT NOT NULL 
    );`);
    await db.exec(`
        CREATE TABLE IF NOT EXISTS transactions
        (
            id INTEGER NOT NULL PRIMARY KEY,
            walletid INTEGER NOT NULL,
            type TEXT NOT NULL,
            amount FLOAT NOT NULL
        );
    `);
    await db.exec(`
        CREATE TABLE IF NOT EXISTS trips
        (
            id INTEGER NOT NULL PRIMARY KEY,
            companyid INTEGER NOT NULL,
            driverid INTEGER NOT NULL,
            from TEXT NOT NULL,
            to TEXT NOT NULL,
            price TEXT NOT NULL,
            time DATETIME NOT NULL
        );    
    `);
}
main();

