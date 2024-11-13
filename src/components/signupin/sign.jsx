import { useState } from 'react';
import * as Component from '../signupin/component.jsx';
import '../signupin/sign.css'

function SignInUpForm(){
  const [signin, toggle] = useState(true); // ensure `signin` is used consistently
  return(
    <div className='body'>
    <Component.Container className='container'>
      <Component.SignUpContainer signinIn={signin}>
        <Component.Form>
          <Component.Title>Create Account</Component.Title>
          <Component.Input type='text' placeholder='Name'/>
          <Component.Input type='email' placeholder='Email'/>
          <Component.Input type='password' placeholder='Password'/>
          <Component.Button>Sign Up</Component.Button>
        </Component.Form>
      </Component.SignUpContainer>

      <Component.SignInContainer signinIn={signin}>
        <Component.Form>
          <Component.Title>Sign in</Component.Title>
          <Component.Input type='email' placeholder='Email' />
          <Component.Input type='password' placeholder='Password' />
          <Component.Button className='signin'>Sign In</Component.Button>
          {/* <Component.Anchor href='#'>Forgot your password?</Component.Anchor> */}
        </Component.Form>
      </Component.SignInContainer>

      <Component.OverlayContainer signinIn={signin}>
        <Component.Overlay signinIn={signin}>
          <Component.LeftOverlayPanel signinIn={signin}>
            <Component.Title>Welcome Back!</Component.Title>
            <Component.Paragraph>
              To keep connected with us please login with your personal info
            </Component.Paragraph>
            <Component.GhostButton onClick={() => toggle(true)}>
              Sign In
            </Component.GhostButton>
          </Component.LeftOverlayPanel>

          <Component.RightOverlayPanel signinIn={signin}>
            <Component.Title>Hello, Friend!</Component.Title>
            <Component.Paragraph>
              Enter Your personal details and start your journey with us
            </Component.Paragraph>
            <Component.GhostButton onClick={() => toggle(false)}>
              Sign Up
            </Component.GhostButton> 
          </Component.RightOverlayPanel>
        </Component.Overlay>
      </Component.OverlayContainer>
    </Component.Container></div>
  )
}

export default SignInUpForm;
