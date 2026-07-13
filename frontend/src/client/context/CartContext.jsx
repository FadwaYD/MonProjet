import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();
const PANIER_KEY = "panier_produits";

export function CartProvider({ children }) {
  const [panier, setPanier] = useState(() => {
    try {
      const saved = localStorage.getItem(PANIER_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [panierOuvert, setPanierOuvert] = useState(false);
  const [messagePanier, setMessagePanier] = useState("");

  useEffect(() => {
    localStorage.setItem(PANIER_KEY, JSON.stringify(panier));
  }, [panier]);

  const quantiteDejaDansPanier = (produitId) => {
    const item = panier.find((p) => String(p.id) === String(produitId));
    return item ? item.quantite : 0;
  };

  const ajouterAuPanier = (produit, quantite) => {
    if (!produit) return;

    if (produit.stock <= 0) {
      setMessagePanier("Ce produit est en rupture de stock.");
      setTimeout(() => setMessagePanier(""), 3000);
      return false;
    }

    const dejaPanier = quantiteDejaDansPanier(produit.id);
    const totalDemande = dejaPanier + quantite;

    if (totalDemande > produit.stock) {
      const restant = produit.stock - dejaPanier;
      setMessagePanier(
        restant <= 0
          ? "Vous avez déjà atteint la quantité maximale disponible en stock."
          : `Stock insuffisant : il ne reste que ${restant} unité(s) disponible(s).`
      );
      setTimeout(() => setMessagePanier(""), 3000);
      return false;
    }

    setPanier((prev) => {
      const existe = prev.find((p) => String(p.id) === String(produit.id));
      if (existe) {
        return prev.map((p) =>
          String(p.id) === String(produit.id)
            ? { ...p, quantite: p.quantite + quantite }
            : p
        );
      }
      return [
        ...prev,
        {
          id: produit.id,
          nom: produit.nom,
          marque: produit.marque,
          prix: produit.prix,
          image: produit.image,
          stock: produit.stock,
          quantite: quantite,
        },
      ];
    });

    setPanierOuvert(true);
    return true;
  };

  const supprimerDuPanier = (produitId) => {
    setPanier((prev) => prev.filter((p) => String(p.id) !== String(produitId)));
  };

  const changerQuantitePanier = (produitId, delta) => {
    setPanier((prev) =>
      prev.map((p) => {
        if (String(p.id) !== String(produitId)) return p;
        const nouvelleQte = p.quantite + delta;
        if (nouvelleQte < 1) return p;
        if (nouvelleQte > p.stock) return p;
        return { ...p, quantite: nouvelleQte };
      })
    );
  };

  const viderPanier = () => setPanier([]);

  const totalPanier = panier.reduce(
    (sum, p) => sum + Number(p.prix) * p.quantite,
    0
  );

  const nbArticlesPanier = panier.reduce((sum, p) => sum + p.quantite, 0);

  return (
    <CartContext.Provider
      value={{
        panier,
        panierOuvert,
        setPanierOuvert,
        messagePanier,
        ajouterAuPanier,
        supprimerDuPanier,
        changerQuantitePanier,
        viderPanier,
        totalPanier,
        nbArticlesPanier,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart doit être utilisé à l'intérieur d'un CartProvider");
  }
  return context;
}