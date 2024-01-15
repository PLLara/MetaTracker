import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import "./EstiloTelaPrincipal.css";
const TelaPrincipal = () => {
  const [categorias, setCategorias] = useState([]);
  const [nextCategoryId, setNextCategoryId] = useState(0);
  const [isPressed, setIsPressed] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startScrollLeft, setStartScrollLeft] = useState(0);


  const handleMouseUp = () => {
    setIsPressed(false);
  };



  return (
    <>
      <header className="Cabecalho">
        <div className="titulo">
          <h2 className="NomeMetaTracker">
            Meta Tracker{" "}
            <i
              className="fas fa-solid fa-square-check"
              style={{ color: "rgb(32, 146, 0)" }}
            ></i>
          </h2>
        </div>
        <div className="Sair" onClick={() => {
          const supabase = createClient();
          supabase.auth.signOut();
        }}>
          <div className="BotaoSair">
            Sair
          </div>
        </div>
      </header>

      <main
        className="Principal"
        onMouseUp={handleMouseUp}
      >
        <div className="AdicionarCategoria">
          <div className="adicionaCategoria">
            <i className="fa-solid fa-plus"></i>
          </div>
        </div>
      </main>

      <div id="popup" className="popup">
        <div className="popup-content">
          <p id="popup-text"></p>
          <button
            className="botoesConfirmarExclusao botaoConfirmar"
            id="popup-confirm"
            onClick={() => { }}
          >
            Confirmar
          </button>
          <button
            className="botoesConfirmarExclusao botaoCancelar"
            id="popup-cancel"
            onClick={() => { }}
          >
            Cancelar
          </button>
        </div>
      </div>

      {/* Your script tags */}
    </>
  );
};

export default TelaPrincipal;
