// import React from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router";
import SocialLogIn from "../SocialLogIn/SocialLogIn";
import useAuth from "../../../hooks/useAuth";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const {signIn} = useAuth();

  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from || '/';

  const onSubmit = (data) => {
    signIn(data.email, data.password)
    .then(result =>{
      console.log(result.user)
      navigate(from)
    })
    .catch(error=> console.log(error)
    )
  };

  return (
    <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
      <div className="card-body">
        <h1 className="text-5xl font-bold">Please LogIn</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <fieldset className="fieldset">
            <label className="label">Email</label>
            <input
              type="email"
              {...register("email")}
              className="input"
              placeholder="Email"
            />
            <label className="label">Password</label>
            <input
              type="password"
              {...register("password", {
                required: true,
                minLength: 6,
              })}
              className="input"
              placeholder="Password"
            />
            {errors.password?.type === "required" && (
              <p className="text-red-700">Password is required</p>
            )}

            {errors.password?.type === "minLength" && (
              <p className="text-red-500">
                Password Must be 6 characters or longer
              </p>
            )}
            <div>
              <a className="link link-hover">Forgot password?</a>
            </div>
            <button className="btn btn-primary text-black font-semibold mt-4">Login</button>
          </fieldset>
          
        </form>
        <SocialLogIn></SocialLogIn>
        <p>
            <small>
              New to this website?
              <Link state = {{from}} className="btn btn-link -ml-2" to="/register">
                Register
              </Link>
            </small>
          </p>
      </div>
    </div>
  );
};

export default Login;
