import photo from '../assets/photos/paradiznikova-omaka.jpg';

/** Split screen for the login and registration forms; the photo is decorative. */
export default function AuthLayout({ title, intro, children }) {
  return (
    <section className="auth">
      <div className="auth-visual" aria-hidden="true">
        <img src={photo} alt="" />
        <div className="auth-visual-text">
          <p className="auth-quote">»Dober teden se začne z dobrim načrtom.«</p>
          <p>Recepti, tedenski načrt obrokov in nakupovalni seznam na enem mestu.</p>
        </div>
      </div>
      <div className="auth-panel">
        <h1>{title}</h1>
        {intro && <p className="muted auth-intro">{intro}</p>}
        {children}
      </div>
    </section>
  );
}
