export function Footer() {
  const currentYear = new Date().getFullYear();
  const appName = import.meta.env.VITE_APP_NAME || 'Application';
  // Static ISO-related links for demo purposes
  const privacyUrl = 'https://www.iso.org/standard/71670.html'; // ISO/IEC 27701
  const termsUrl = 'https://www.iso.org/terms-conditions.html';
  const securityUrl = 'https://www.iso.org/isoiec-27001-information-security.html';
  const supportUrl = 'https://www.iso.org/contact-iso.html';
  const complianceUrl = 'https://www.iso.org/conformity-assessment.html';

  return (
    <footer className="footer">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-center md:justify-between items-center gap-3 py-5">
          <div className="flex order-2 md:order-1 gap-2 font-normal text-sm">
            <span className="text-muted-foreground">{currentYear} &copy; {appName}. All rights reserved.</span>
          </div>
          <nav className="flex order-1 md:order-2 gap-4 font-normal text-sm text-muted-foreground">
            <a href={privacyUrl} target="_blank" rel="noopener" className="hover:text-primary">
              Privacy
            </a>
            <a href={termsUrl} target="_blank" rel="noopener" className="hover:text-primary">
              Terms
            </a>
            <a href={securityUrl} target="_blank" rel="noopener" className="hover:text-primary">
              Security
            </a>
            <a href={supportUrl} target="_blank" rel="noopener" className="hover:text-primary">
              Support
            </a>
            <a href={complianceUrl} target="_blank" rel="noopener" className="hover:text-primary">
              Compliance
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
