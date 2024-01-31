import { createClient } from "@/utils/supabase/client";
import { faCheck, faEdit, faListOl, faPen, faPlus, faSquareCheck, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Session, User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import * as z from "zod";
import "./EstiloTelaPrincipal.css";

const CategorieSchema = z.object({
  id: z.number(),
  created_at: z.string(), // Assuming you want to represent timestamp as a string for simplicity
  nome: z.string(),
  cor: z.string(),
  user_id: z.string().nullable(),
});

const cardSchema = z.object({
  id: z.number(),
  created_at: z.string(),
  texto: z.string().nullable(),
  categoria: z.number().nullable(),
  data_terminou: z.string().nullable(),
  status: z.string().nullable(),
  user_id: z.string().nullable(),
});

type Categorie = z.infer<typeof CategorieSchema>;
type Card = z.infer<typeof cardSchema>;


const TelaPrincipal = (props: {
  auth: {
    user: User | null;
    session: Session | null;
  }
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [categorias, setCategorias] = useState([] as Categorie[]);
  const [cards, setCards] = useState([] as Card[]);
  const [categoriasCurrentlyEditing, setCategoriasCurrentlyEditing] = useState([] as string[]);

  const fetchCategorias = async () => {
    const rawData = await fetch("https://metatracker-9e4429fd03ba.herokuapp.com/categorias", {
      headers: {
        "authorization": `${props.auth.session?.access_token}`,
      },
    });
    const parsedData = await rawData.json();
    setCategorias(z.array(CategorieSchema).parse(parsedData.lista_categorias));
    setCategoriasCurrentlyEditing([]);
  };

  const fetchCards = async () => {
    const rawData = await fetch("https://metatracker-9e4429fd03ba.herokuapp.com/cards", {
      headers: {
        "authorization": `${props.auth.session?.access_token}`,
      },
    });
    const parsedData = await rawData.json();
    setCards(z.array(cardSchema).parse(parsedData.lista_categorias));
    setCategoriasCurrentlyEditing([]);
  }

  useEffect(() => {
    Promise.all([fetchCategorias(), fetchCards()]).then(() => {
      setIsLoading(false);
    }
    );
  }, [props.auth.user?.id]);

  return (
    <>
      <header className="Cabecalho" style={{
        width: "100%",
      }}>
        <div className="titulo">
          <h2 className="NomeMetaTracker">
            Meta Tracker
            <FontAwesomeIcon icon={faSquareCheck} style={{ color: "rgb(32, 146, 0)" }} />
          </h2>
        </div>
        <div className="Sair" style={{
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
        }} onClick={async () => {
          setIsLoading(true);
          const supabase = createClient();
          await supabase.auth.signOut();
          setIsLoading(false);
        }}>
          <div className="BotaoSair">
            Sair
          </div>
        </div>
      </header>

      {
        LoadingOverlay(isLoading)
      }

      <main className="Principal">
        {categorias
          .sort((a, b) => {
            if (a.created_at < b.created_at) return -1;
            if (a.created_at > b.created_at) return 1;
            return 0;
          }
          )
          .map((categoria) => (
            <div className="Categoria" id="categoria1" key={categoria.id.toString()} style={{
              backgroundColor: categoria.cor,
            }}>
              <header className="CabecalhoCartao" style={{
                backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.3), transparent)",
                color: (parseInt(categoria.cor.slice(1, 3), 16) + parseInt(categoria.cor.slice(3, 5), 16) + parseInt(categoria.cor.slice(5, 7), 16)) / 3 > 128 ? "black" : "white",
              }}>
                <div className="CabecalhoCartaoParteSuperior">
                  <h2 className="TituloCategoria">{categoria.nome}</h2>
                  <div className="menuCategoria">
                    <input type="color" className="inputCorDaCategoria" name="corDoCartao" value="#bbbbbb" />
                    <FontAwesomeIcon icon={faTrash} className="editarTituloCartao" onClick={RemoverCategoria(categoria)} />
                    <FontAwesomeIcon icon={faEdit} className="editarTituloCartao" onClick={EditarCategoria(categoria)} />

                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: "white",
                      padding: "0.5rem",
                    }}>
                      <input type="color" name="corDoCartao" value={categoria.cor} onChange={async (event) => {
                        setCategoriasCurrentlyEditing([...categoriasCurrentlyEditing, categoria.id.toString()]);
                        setCategorias(categorias.map((c) => {
                          if (c.id === categoria.id) {
                            return {
                              ...c,
                              cor: event.target.value,
                            };
                          }
                          return c;
                        }
                        ));
                      }} />
                      {
                        categoriasCurrentlyEditing.includes(categoria.id.toString()) && <div>
                          <FontAwesomeIcon icon={faCheck}
                            style={{
                              color: ((parseInt(categoria.cor.slice(1, 3), 16) + parseInt(categoria.cor.slice(3, 5), 16) + parseInt(categoria.cor.slice(5, 7), 16)) / 3 > 128) ? "black" : "white",
                            }}
                            className="editarTituloCartao" onClick={async () => {
                              setIsLoading(true);
                              try {
                                await fetch("https://metatracker-9e4429fd03ba.herokuapp.com/categorias/" + categoria.id, {
                                  method: "PUT",
                                  headers: {
                                    "Content-Type": "application/json",
                                    "authorization": `${props.auth.session?.access_token}`,
                                  },
                                  body: JSON.stringify({
                                    cor: categoria.cor,
                                  }),
                                });
                                await fetchCategorias();
                              } catch (error) {
                                alert("Não foi possível excluir a categoria");
                              }
                              setCategoriasCurrentlyEditing(categoriasCurrentlyEditing.filter((id) => id !== categoria.id.toString()));
                              setIsLoading(false);
                            }} />
                        </div>
                      }

                    </div>

                  </div>
                </div>
                <div className="CabecalhoCartaoParteInferior">
                  <FontAwesomeIcon icon={faListOl} />
                  <p className="quantidadeMetas1"> {cards.filter((card) => card.categoria === categoria.id).length} metas</p>
                </div>
              </header>

              <ul className="AreaMetas">

                {
                  cards.filter((card) => card.categoria === categoria.id).sort((a, b) => {
                    if (a.created_at < b.created_at) return -1;
                    if (a.created_at > b.created_at) return 1;
                    return 0;
                  })
                    .map((card) => (
                      <li className="meta" key={card.id.toString()}>
                        <div className="checkboxEMeta" onClick={async () => {
                          setIsLoading(true);
                          try {
                            await fetch("https://metatracker-9e4429fd03ba.herokuapp.com/cards/" + card.id, {
                              method: "PUT",
                              headers: {
                                "Content-Type": "application/json",
                                "authorization": `${props.auth.session?.access_token}`,
                              },
                              body: JSON.stringify({
                                data_terminou: card.data_terminou ? null : new Date().toISOString(),
                              }),
                            });
                            await fetchCards();
                          } catch (error) {
                            alert("Não foi possível excluir a categoria");
                          }
                          setIsLoading(false);
                        }}>
                          <input type="checkbox" id="categoria1Meta0" className="checkbox-escondido" />
                          <label className="checkbox-personalizado">
                            {
                              card.data_terminou ? <FontAwesomeIcon icon={faSquareCheck} className="checkbox-personalizado" /> : ""
                            }
                          </label>
                          <p className="tituloTarefa1Meta0">{card.texto}</p>
                        </div>
                        <div className="EditarEApagar">
                          <FontAwesomeIcon icon={faPen} className="editarTituloCartao" onClick={async () => {
                            setIsLoading(true);
                            try {
                              await fetch("https://metatracker-9e4429fd03ba.herokuapp.com/cards/" + card.id, {
                                method: "PUT",
                                headers: {
                                  "Content-Type": "application/json",
                                  "authorization": `${props.auth.session?.access_token}`,
                                },
                                body: JSON.stringify({
                                  texto: prompt("Digite o novo nome da meta"),
                                }),
                              });
                              await fetchCards();
                            } catch (error) {
                              alert("Não foi possível excluir a categoria");

                            }
                            setIsLoading(false);
                          }} />
                          <FontAwesomeIcon icon={faTrash} className="editarTituloCartao" onClick={async () => {
                            setIsLoading(true);
                            try {
                              await fetch("https://metatracker-9e4429fd03ba.herokuapp.com/cards/" + card.id, {
                                method: "DELETE",
                                headers: {
                                  "Content-Type": "application/json",
                                  "authorization": `${props.auth.session?.access_token}`,
                                },
                              });
                              await fetchCards();
                            } catch (error) {
                              alert("Não foi possível excluir a categoria");

                            }
                            setIsLoading(false);
                          }} />
                        </div>
                      </li>
                    ))
                }

                <li className="adicionarMeta" onClick={async () => {
                  setIsLoading(true);
                  try {
                    const x = prompt("Digite o nome da meta");
                    if (!x) throw new Error("Nome inválido");

                    await fetch("https://metatracker-9e4429fd03ba.herokuapp.com/cards", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        "authorization": `${props.auth.session?.access_token}`,
                      },
                      body: JSON.stringify({
                        texto: x,
                        categoria: categoria.id,
                      }),
                    });
                    await fetchCards();
                  } catch (error) {
                    alert("Não foi possível adicionar a categoria");
                    console.log(error);
                  }
                  setIsLoading(false);

                }}>

                  <FontAwesomeIcon icon={faPlus} />
                </li>
              </ul>
            </div>
          ))}
        <div className="AdicionarCategoria" onClick={async () => {
          setIsLoading(true);
          try {
            const x = prompt("Digite o nome da categoria");
            if (!x) throw new Error("Nome inválido");

            await fetch("https://metatracker-9e4429fd03ba.herokuapp.com/categorias", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "authorization": `${props.auth.session?.access_token}`,
              },
              body: JSON.stringify({
                nome: x,
                cor: "#bbbbbb",
              }),
            });
            await fetchCategorias();
          } catch (error) {
            alert("Não foi possível adicionar a categoria");

          }
          setIsLoading(false);

        }}>
          <div className="adicionaCategoria">
            <FontAwesomeIcon icon={faPlus}>{ }</FontAwesomeIcon>
          </div>
        </div>
      </main>
    </>
  );

  function EditarCategoria(categoria: { id: number; created_at: string; nome: string; cor: string; user_id: string | null; }) {
    return async () => {
      setIsLoading(true);
      try {
        await fetch("https://metatracker-9e4429fd03ba.herokuapp.com/categorias/" + categoria.id, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "authorization": `${props.auth.session?.access_token}`,
          },
          body: JSON.stringify({
            nome: prompt("Digite o novo nome da categoria"),
          }),
        });
        await fetchCategorias();
      } catch (error) {
        alert("Não foi possível excluir a categoria");

      }
      setIsLoading(false);
    };
  }

  function RemoverCategoria(categoria: { id: number; created_at: string; nome: string; cor: string; user_id: string | null; }) {
    return async () => {
      setIsLoading(true);
      try {
        if (!window.confirm("Tem certeza que deseja excluir a categoria?")) throw "Usuário cancelou a exclusão";
        await fetch("https://metatracker-9e4429fd03ba.herokuapp.com/categorias/" + categoria.id, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "authorization": `${props.auth.session?.access_token}`,
          },
        });
        await fetchCategorias();
      } catch (error) {
        alert(error);
      }
      setIsLoading(false);
    };
  }
};

export default TelaPrincipal;
function LoadingOverlay(isLoading: boolean) {
  return isLoading && <div style={{
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: "100%",
    height: "100%",
    zIndex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
  }}>
    <h1>
      Carregando...
    </h1>
  </div>;
}

