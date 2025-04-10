import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="font-sans text-gray-800">
      <header className="bg-white shadow p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Ma Collection{" "}
          <span className="text-gray-500 font-normal text-lg">de Timbres</span>
        </h1>
        <nav>
          <ul className="flex gap-4 items-center">
            <li>
              <a href="#accueil" className="hover:text-blue-500">
                Accueil
              </a>
            </li>
            <li>
              <a href="#collection" className="hover:text-blue-500">
                Collection
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:text-blue-500">
                Contact
              </a>
            </li>
            <li>
              <img
                src="/images/instagram.png"
                alt="Instagram"
                className="w-5 h-5"
              />
            </li>
          </ul>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <section
          id="introduction"
          className="intro-section flex flex-col md:flex-row gap-8 items-center mb-12"
        >
          <figure className="w-full md:w-1/2">
            <img
              src="/images/patrick-you.png"
              alt="Collection de timbres"
              className="w-full rounded shadow object-cover"
            />
          </figure>
          <article className="flex-1 space-y-4">
            <h2 className="text-2xl font-bold">Bienvenue dans ma collection</h2>
            <p>YP & YMJ: Yvert et Tellier (YT)</p>
            <p>
              J’ai fait le choix suivant : j’ai privilégié les timbres avec
              oblitération, de préférence avec une belle oblitération : ni trop
              lourde, ni trop effacée, avec le plus d’informations (date, lieu)
              possible.
            </p>
            <p>
              Il est vrai qu’à quelques exceptions près, la valeur marchande
              d’un neuf est supérieure à l’oblitéré. Mais un neuf contrefait est
              aujourd’hui facile à produire. L’oblitéré, le vrai, reste
              intéressant à collectionner.
            </p>
            <p>
              Ne seront pas mis sauf exception ceux désignés comme émissions
              abusives (point noir) : Émirats arabes, Guinée équatoriale, RP
              Kampuchéa, Lao, Yémen, etc. Sont conservés uniquement ceux liés au
              pays concerné.
            </p>
            <p>
              Les séries thématiques pseudo-oblitérées sont exclues si elles
              n'ont jamais circulé par courrier.
            </p>
            <p>
              Je ne garde que les timbres avec un vrai cachet. Même les JO sont
              exclus si le pays n’a pas participé officiellement.
            </p>
            <p>
              Certains pays produisent des timbres comme des images (appelés
              Cinderellas). Ce type est exclu sauf intérêt philatélique réel.
            </p>
            <p>Le but : une collection sérieuse, historique, et authentique.</p>
          </article>
        </section>

        <section className="intro-section mb-12">
          <article className="space-y-3">
            <h2 className="text-2xl font-semibold">
              Présentation de l'application
            </h2>
            <p>
              Cette application permet de gérer, consulter et enrichir une
              collection de timbres organisée avec soin selon les pays, statuts
              et albums.
            </p>
            <p>
              Elle est conçue pour fonctionner aussi bien en ligne qu'en local,
              et remplace efficacement les anciens fichiers Excel.
            </p>
            <p>
              Découvrez votre collection comme jamais auparavant, avec tri,
              recherche, statistiques et filtres dynamiques !
            </p>
          </article>
        </section>

        <section
          id="collection"
          className="flex flex-col items-center justify-center text-center mb-16 bg-gray-100 p-8 rounded shadow"
        >
          <h2 className="text-2xl font-semibold mb-4">
            🎯 Accéder à la collection
          </h2>
          <Link
            to="/collection"
            className="mt-2 inline-block bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold px-10 py-3 rounded-full shadow-lg hover:scale-105 hover:from-indigo-500 hover:to-blue-600 transition-all duration-300"
          >
            Entrer
          </Link>
        </section>

        <section id="contact" className="bg-white shadow p-6 rounded">
          <h2 className="text-xl font-bold mb-2">Contact</h2>
          <p className="mb-4">
            Une suggestion, un problème ou une nouvelle idée pour améliorer
            l’app ? Écrivez-moi !
          </p>
          <form className="grid gap-4">
            <label htmlFor="name">Nom</label>
            <input
              type="text"
              name="name"
              id="name"
              className="border p-2 rounded"
            />
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              className="border p-2 rounded"
            />
            <label htmlFor="message">Message</label>
            <textarea
              name="message"
              id="message"
              cols="30"
              rows="6"
              className="border p-2 rounded"
            ></textarea>
            <input
              type="submit"
              value="Envoyer"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            />
          </form>
        </section>
      </main>

      <footer className="text-center py-6 text-sm text-gray-500">
        Mentions légales
      </footer>
    </div>
  );
}
