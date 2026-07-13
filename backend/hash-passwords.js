/**
 * hash-passwords.js
 * ------------------
 * Re-hash en bcrypt tous les mots de passe stockés en clair
 * dans la table `utilisateurs`.
 *
 * Utilisation :
 *   1. Placer ce fichier à la racine de votre backend (à côté de config/db.js)
 *   2. npm install bcrypt   (si pas déjà installé)
 *   3. node hash-passwords.js
 *
 * Le script détecte automatiquement les mots de passe qui ne sont PAS
 * déjà des hashs bcrypt (un hash bcrypt commence toujours par $2a$, $2b$ ou $2y$)
 * pour éviter de re-hasher un hash déjà correct si vous relancez le script.
 */

const bcrypt = require("bcrypt");
const db = require("./config/db"); // adapte le chemin si besoin

const isBcryptHash = (value) => /^\$2[aby]\$\d{2}\$/.test(value);

async function run() {
    db.query("SELECT id, email, mot_de_passe FROM utilisateurs", async (err, users) => {
        if (err) {
            console.error("Erreur lors de la récupération des utilisateurs :", err);
            process.exit(1);
        }

        console.log(`${users.length} utilisateur(s) trouvé(s).`);

        let updated = 0;
        let skipped = 0;

        for (const user of users) {
            if (isBcryptHash(user.mot_de_passe)) {
                console.log(`⏭️  ${user.email} : déjà hashé, ignoré.`);
                skipped++;
                continue;
            }

            try {
                const hash = await bcrypt.hash(user.mot_de_passe, 10);

                await new Promise((resolve, reject) => {
                    db.query(
                        "UPDATE utilisateurs SET mot_de_passe = ? WHERE id = ?",
                        [hash, user.id],
                        (updateErr) => {
                            if (updateErr) return reject(updateErr);
                            resolve();
                        }
                    );
                });

                console.log(`✅ ${user.email} : mot de passe hashé.`);
                updated++;
            } catch (hashErr) {
                console.error(`❌ Erreur pour ${user.email} :`, hashErr);
            }
        }

        console.log(`\nTerminé. ${updated} mis à jour, ${skipped} déjà OK.`);
        process.exit(0);
    });
}

run();