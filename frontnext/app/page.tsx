
'use client';
import { createClient } from '@/utils/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import TelaPrincipal from "../components/principal";

const CadastroScreen = () => {
  const [telaLogin, setTelaLogin] = useState(true);
  const [userID, setUserID] = useState('');
  const [email, setEmail] = useState('');
  const [password, setSenha] = useState('');
  const [auth, setAuth] = useState(null as {
    user: User | null;
    session: Session | null;
  } | null);

  // on auth change
  useEffect(() => {
    const supabase = createClient();
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // if not logged set to null
        if (event === 'SIGNED_OUT') {
          setAuth(null);
          return;
        }
        if (event === 'SIGNED_IN') {
          setAuth({ user: session?.user ?? null, session });
          return;
        }
      }
    );
  }
  );


  const signIn = async () => {
    try {
      const supabase = createClient();
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password: password
      });
      if (error) {
        alert(error.message);
        return;
      }
    } catch (error) {
      alert(error);
      return;
    }
  };

  const signUp = async () => {
    const supabase = createClient();
    const { error, data } = await supabase.auth.signUp({
      email,
      password
    });
    if (error) {
      alert(error.message);
      return;
    }
  };

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Login - Meta Tracker</title>
        <link rel="shortcut icon" type="image/x-icon" href="Login/Imagens/CheckIcon.png" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.7/css/all.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Saira+Extra+Condensed:wght@500&display=swap" rel="stylesheet" />
      </Head>
      {
        auth ?
          <TelaPrincipal /> : <>

            <main className="conteudoPrincipal" id="id_conteudoPrincipal">
              <div className={`TelaLogin`} id={`id_telaLogin}`}>
                <h2 className="nome_titulo">{telaLogin ? 'Meta Tracker' : 'Realizar cadastro'}</h2>
                <form className="formularioLogin">
                  {
                    !telaLogin && <>
                      <div className="campoIconeTextoLabel">
                        <i className="fas fa-solid fa-user"></i>
                        <label htmlFor={telaLogin ? 'id_UsuarioLogin' : 'id_UsuarioCadastro'}>Usuário</label>
                      </div>
                      <input
                        id={telaLogin ? 'id_UsuarioLogin' : 'id_UsuarioCadastro'}
                        name="UserID"
                        className="inputs"
                        type="text"
                        value={userID}
                        onChange={(e) => setUserID(e.target.value)}
                      />
                    </>
                  }

                  <div className="campoIconeTextoLabel">
                    <i className="fas fa-regular fa-envelope"></i>
                    <label htmlFor="id_emailCadastro">E-mail</label>
                  </div>
                  <input
                    type="email"
                    className="inputs"
                    name="emailCadastro"
                    id="id_emailCadastro"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="campoIconeTextoLabel">
                    <i className="fas fa-solid fa-key"></i>
                    <label htmlFor={telaLogin ? 'id_SenhaLogin' : 'id_SenhaCadastro'}>Senha</label>
                  </div>
                  <input
                    id={telaLogin ? 'id_SenhaLogin' : 'id_SenhaCadastro'}
                    name="Senha"
                    className="inputs"
                    type={'password'}
                    value={password}
                    onChange={(e) => setSenha(e.target.value)}
                  />

                </form>
                <button
                  type="submit"
                  className="BotaoRealizarLogin"
                  onClick={() => {
                    if (telaLogin) {
                      signIn();
                    } else {
                      signUp();
                    }
                  }}
                >
                  {telaLogin ? 'Entrar' : 'Cadastrar'}
                </button>
              </div>
            </main>
            <br />
            <br />
            <br />
            <center>
              <button
                type="submit"
                className="BotaoRealizarLogin"
                onClick={() => {
                  setTelaLogin(!telaLogin)
                }}
              >
                {telaLogin ? 'Ir para Cadastro' : 'Ir para Login'}
              </button>
            </center >
          </>
      }
    </>
  );
};

export default CadastroScreen;
