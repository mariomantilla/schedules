import React, { Component } from "react"
import Auth from "./components/Auth";
import Home from "./components/Home";
import { supabase } from "./api"


class App extends Component {

  constructor(props) {
    super(props)
    this.state = { 
      user: null,
    }
  }

  componentDidMount() {
    const session = supabase.auth.session();
    if (session && session.user) {
      this.setState({
        recoveryMode: false,
        user: session.user,
      });
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user;
        const recoveryMode = event === 'PASSWORD_RECOVERY'
        this.setState({
          user: currentUser || null,
          recoveryToken: recoveryMode ? session.access_token : null,
        });
      }
    );

    return () => authListener.unsubscribe();
  }

  render() {
    return (
      <div className="min-w-full min-h-screen flex items-center justify-center bg-gray-200">
         {!this.state.user ? <Auth /> : <Home user={this.state.user} recoveryToken={this.state.recoveryToken} />}
      </div>
    )
  }
}

export default App
