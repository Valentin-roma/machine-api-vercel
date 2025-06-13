export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ message: "Méthode non autorisée" });
  const { contentJSON } = req.body;
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_USER = "Valentin-roma";
  const GITHUB_REPO = "inventaire-machines"; 
  const FILE_PATH = "data/machines.json";

  try {
    const getResponse = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${FILE_PATH}`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` }
    });

    const getData = await getResponse.json();

    if (!getData.sha) {
      console.log("❌ SHA introuvable :", getData);
      return res.status(500).json({ error: "SHA introuvable", details: getData });
    }

    const sha = getData.sha;
    const contentEncoded = Buffer.from(JSON.stringify(contentJSON, null, 2)).toString('base64');

    const updateResponse = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${FILE_PATH}`, {
      method: "PUT",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "Mise à jour via interface web",
        content: contentEncoded,
        sha: sha
      })
    });

    const result = await updateResponse.json();
    console.log("✅ Résultat GitHub :", result);

    if (!updateResponse.ok) {
      return res.status(updateResponse.status).json({ error: result });
    }

    return res.status(200).json({ message: "OK", githubResult: result });
  } catch (e) {
    console.error("❌ Erreur serveur :", e);
    return res.status(500).json({ error: "Erreur serveur", details: e.message });
  }
}
