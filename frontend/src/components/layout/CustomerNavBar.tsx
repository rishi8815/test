import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import styles from './NavBar.module.css';
import { BeamLogo } from '../BeamLogo';

export default function CustomerNavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = () => setMobileOpen((v) => !v);
  const closeMobile = () => setMobileOpen(false);

  return (
    <header className={styles.navBar}>
      <div className={styles.navBarContainer}>
        <div className={styles.logo}>
          <Link to="/">
            <BeamLogo size={64} />
          </Link>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.navMenu}>
            <li className={styles.navItem}>
              <NavLink to="/customer/products/1" className={styles.navLink}>Products</NavLink>
            </li>
            <li className={styles.navItem}>
              <span className={styles.navLink}>
                Categories <span className={styles.navArrow}>▾</span>
              </span>
              <div className={styles.dropdown}>
                <ul className={styles.dropdownMenu}>
                  <li className={styles.dropdownItem}>
                    <Link to="/products" className={styles.dropdownLink}>Popular</Link>
                  </li>
                  <li className={`${styles.dropdownItem} ${styles.hasSubmenu}`}>
                    <div className={styles.dropdownLinkTrigger}>
                      Electronics <span className={styles.submenuIndicator}>›</span>
                    </div>
                    <div className={styles.submenu}>
                      <ul className={styles.submenuMenu}>
                        <li className={styles.submenuItem}>
                          <Link to="/products" className={styles.submenuLink}>Phones</Link>
                        </li>
                        <li className={styles.submenuItem}>
                          <Link to="/products" className={styles.submenuLink}>Laptops</Link>
                        </li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </li>
            <li className={styles.navItem}>
              <NavLink to="/products" className={styles.navLink}>All Products</NavLink>
            </li>
          </ul>
        </nav>

        <div className={styles.appButtons}>
          {/* Placeholder for app store badges or buttons */}
          <button className={styles.mobileMenuButton} aria-label="Toggle menu" onClick={toggleMobile}>
            <span className={mobileOpen ? 'open' : ''}></span>
            <span className={mobileOpen ? 'open' : ''}></span>
            <span className={mobileOpen ? 'open' : ''}></span>
          </button>
        </div>
      </div>

      <div className={`${styles.mobileNav} ${mobileOpen ? 'open' : ''}`}>
        <ul className={styles.mobileNavMenu}>
          <li className={styles.mobileNavItem}>
            <NavLink to="/customer/products/1" className={styles.mobileNavLink} onClick={closeMobile}>Products</NavLink>
          </li>
          <li className={styles.mobileNavItem}>
            <NavLink to="/products" className={styles.mobileNavLink} onClick={closeMobile}>All Products</NavLink>
          </li>
        </ul>
      </div>

      <div className={`${styles.mobileNavOverlay} ${mobileOpen ? 'open' : ''}`} onClick={closeMobile} />
    </header>
  );
}