from fastapi import APIRouter
from services.auth import AuthService

auth_router=APIRouter(prefix="/auth")  #if /auth is repeating continously we can put it in prefix
authservice=AuthService()

@auth_router.post("/login")
def login():
    response=authservice.login()
    return {"message":response}

@auth_router.post("/signup")
def login():
    response=authservice.signup()
    return {"message":response}

@auth_router.post("/logout")
def login():
    response=authservice.logout()
    return {"message":response}
