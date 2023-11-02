import { useState } from "react";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { Error, Form, Input, Switcher, Title, Wrapper, Btn } from "../components/auth-components";
import GithubButton from "../components/github-btn";
import GoogleButton from "../components/google-btn";

export default function CreateAccount() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { target: {name, value} } = e;
    if (name === "email") {
      setEmail(value)
    } else if (name === "password") {
      setPassword(value)
    }
  };
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (isLoading || email === "" || password === "") return;
    try {
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch(e){
      if (e instanceof FirebaseError){
        setError(e.message);
      }
    } finally {
      setIsLoading(false);
    }
  };
  const onClick = () => {
    sendPasswordResetEmail(auth, email)
    .then(() => {
      alert("가입하신 email을 확인해주세요.");
    })
    .catch(() => {
      alert("등록되지 않은 email입니다.");
    });
  };
  return (
    <Wrapper>
      <Title>Log into 😺</Title>
      <Form onSubmit={onSubmit}>
        <Input
          onChange={onChange}
          name="email" 
          value={email} 
          placeholder="Email" 
          type="email" 
          required
        />
        <Input 
          onChange={onChange}
          name="password"
          value={password} 
          type="password" 
          placeholder="Password" 
          required
        />
        <Input
          type="submit" 
          value={isLoading ?
          "Loading..." : "Log in"}
        />
      </Form>
      {error !== "" ? <Error>{error}</Error>: null}
      <Switcher>
        Don't have an account? {" "}
        <Link to="/create-account">Create one &rarr;</Link>
      </Switcher>
      <Switcher>
        Do you forget your password? {" "}
        <Btn onClick={onClick}>Find one &rarr;</Btn>
      </Switcher>
      <GithubButton />
      <GoogleButton />
    </Wrapper>
  );
}