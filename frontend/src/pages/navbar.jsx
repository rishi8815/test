import React, { useState, useEffect } from "react";
import styles from "./NavBar.module.css"; // Use NavBar styles
import { Link } from "react-router-dom";
import logo from "../../assets/images/logo_beam.png";
import googlePlay from "../../assets/icons/logo_google_play.png";
import appStore from "../../assets/icons/logo_app_store.png";
import strapiService from "../../utils/strapiService"; // Import strapiService

// Helper function to build the navigation hierarchy
const buildHierarchy = (items, parentId = null) => {
  return (
    items
      .filter((item) =>
        item.parent ? item.parent.id === parentId : parentId === null
      )
      .map((item) => ({
        ...item,
        // Ensure items property is initialized as an empty array for type consistency
        // Recursively build children, ensuring sub-items also get an initialized 'items' array
        items: buildHierarchy(items, item.id) || [],
      }))
      // Optional: Sort items by their 'order' property if it exists
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  );
};

function NavBar() {
  // State for mobile menu toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // State to track which mobile submenu is open
  const [activeMobileSubmenu, setActiveMobileSubmenu] = useState(null);
  // State for navigation items
  const [navItems, setNavItems] = useState([]);
  // Env toggles
  // - VITE_DISABLE_STRAPI_NAV: when true, skip Strapi entirely and use static menu
  // - VITE_USE_STRAPI_NAV_PLUGIN: when false, treat navigation plugin as disabled
  //   In hosted Strapi without the plugin, falling back to pages often won't match
  //   the expected nav item shape; prefer our static menu to avoid an empty navbar.
  const envDisable = String(import.meta.env.VITE_DISABLE_STRAPI_NAV || '').toLowerCase() === 'true';
  const usePlugin = String(import.meta.env.VITE_USE_STRAPI_NAV_PLUGIN || '').toLowerCase() === 'true';
  const disableStrapiNav = envDisable || !usePlugin;

  // Fallback navigation structure
  // Updated to match requested menu: Beam, Projects, For Consumers, Business Opportunities, Beam Shop
  const fallbackNavItems = [
    {
      id: 200,
      title: "Beam Wallet",
      type: "WRAPPER",
      items: [
        { id: 214, title: "About Us", type: "INTERNAL", path: "/about-us" },
        { id: 219, title: "News", type: "INTERNAL", path: "/news" },
        { id: 215, title: "Blog", type: "EXTERNAL", externalPath: "https://www.blog.beamwallet.com/" },
        { id: 217, title: "Help", type: "INTERNAL", path: "/help" },
        { id: 2161, title: "Careers", type: "INTERNAL", path: "/careers" },
      ],
    },
    {
      id: 100,
      title: "Projects",
      type: "WRAPPER",
      items: [
        { id: 101, title: "For Investors", type: "INTERNAL", path: "/for-investors" },
        { id: 102, title: "Beam Token Info", type: "EXTERNAL", externalPath: "https://ico.beamwallet.com/" },
        { id: 103, title: "Buy Token", type: "EXTERNAL", externalPath: "https://participate.beamwallet.com/register" },
        {
          id: 110,
          title: "For Technology Partners",
          type: "WRAPPER",
          items: [
            { id: 111, title: "The Role of Technology Partners", type: "INTERNAL", path: "/technology-partners/role" },
            { id: 120, title: "Banks", type: "INTERNAL", path: "/technology-partners/banks" },
            { id: 121, title: "Software Partners", type: "INTERNAL", path: "/technology-partners/software-partners" },
            { id: 122, title: "Visionary Developers", type: "INTERNAL", path: "/technology-partners/visionary-developers" },
          ],
        },
        { id: 130, title: "Local Partners", type: "INTERNAL", path: "/local-partners" },
        { id: 131, title: "Commercial Agents", type: "INTERNAL", path: "/local-partners" },
      ],
    },
    {
      id: 300,
      title: "For Consumers",
      type: "WRAPPER",
      items: [
        { id: 301, title: "Pay in Store", type: "INTERNAL", path: "/for-consumers/pay-in-store" },
        { id: 302, title: "Pay Online", type: "INTERNAL", path: "/for-consumers/pay-online" },
      ],
    },
    {
      id: 400,
      title: "Business Opportunities",
      type: "WRAPPER",
      items: [
        { id: 401, title: "Affiliate Program", type: "EXTERNAL", externalPath: "https://www.agents.beamwallet.com/" },
        { id: 402, title: "Agents", type: "EXTERNAL", externalPath: "https://www.agents.beamwallet.com/" },
      ],
    },
    {
      id: 500,
      title: "Beam Shop",
      type: "EXTERNAL",
      externalPath: "https://shop.beamwallet.com",
    },
  ];
  
  const normalizeInvestorLinks = (items) => {
    return items.map((item) => {
      const copy = { ...item };
      if (copy.type === "INTERNAL") {
        if (copy.related && typeof copy.related.slug === "string") {
          const slug = copy.related.slug.trim().toLowerCase();
          if (slug === "investors" || slug === "forinvestors") {
            copy.related = { ...copy.related, slug: "technology-partnerships" };
          }
          if (slug === "beamwallet&banks") {
            copy.related = { ...copy.related, slug: "banks" };
          }
        }
        if (typeof copy.path === "string") {
          const p = copy.path.trim().toLowerCase();
          if (p === "/investors" || p === "/forinvestors") {
            copy.path = "/technology-partnerships";
          }
          if (p === "/beamwallet&banks" || p === "beamwallet&banks") {
            copy.path = "/banks";
          }
        }
      }
      if (Array.isArray(copy.items) && copy.items.length > 0) {
        copy.items = normalizeInvestorLinks(copy.items);
      }
      return copy;
    });
  };

  // Remove specific titles from ONLY the top-level of the menu
  const removeTopLevelTitles = (items, titles) => {
    const cmp = (titles || []).map((t) => String(t).trim().toLowerCase());
    return (items || []).filter(
      (x) => !cmp.includes(String(x.title || '').trim().toLowerCase())
    );
  };

  

  useEffect(() => {
    const fetchNav = async () => {
      if (disableStrapiNav) {
        console.log('[NavBar] Using static navigation via VITE_DISABLE_STRAPI_NAV');
        setNavItems(fallbackNavItems);
        return;
      }
      try {
        const flatNavData = await strapiService.getNavigation();
        console.log('Fetched navigation data:', flatNavData); // <-- Log navigation data for debugging
        let structuredNavItems = [];
        if (flatNavData && Array.isArray(flatNavData)) {
          // If items already contain nested `items`, use as-is; otherwise build hierarchy from flat data
          const looksHierarchical = flatNavData.some(it => Array.isArray(it.items));
          structuredNavItems = looksHierarchical ? flatNavData : buildHierarchy(flatNavData);
        } else if (
          flatNavData &&
          flatNavData.data &&
          Array.isArray(flatNavData.data)
        ) {
          const dataArr = flatNavData.data;
          const looksHierarchical = dataArr.some(it => Array.isArray(it.items));
          structuredNavItems = looksHierarchical ? dataArr : buildHierarchy(dataArr);
        }
        console.log('Structured navItems for rendering:', structuredNavItems); // <-- Log hierarchy for debugging
        // If the structured data has no recognizable nav item types, fall back to static menu.
        // This commonly happens when Strapi Navigation plugin is unavailable and the service
        // returns the Pages collection, which doesn't include nav item fields like `type`.
        const hasTypes = (structuredNavItems || []).some(
          (it) => it && typeof it.type === 'string'
        );
        if (!hasTypes) {
          console.warn('[NavBar] No valid nav item types detected. Falling back to static menu.');
          setNavItems(fallbackNavItems);
          return;
        }
        // Keep primary top-level items: WRAPPER groups, INTERNAL links, and allowed EXTERNAL (e.g., Beam Shop)
        const primaryTopLevel = (structuredNavItems || []).filter((it) => {
          if (it && typeof it.type === 'string') {
            const t = it.type.toUpperCase();
            return t === 'WRAPPER' || t === 'EXTERNAL' || t === 'INTERNAL';
          }
          return false;
        });
        const normalizedTop = normalizeInvestorLinks(primaryTopLevel);

        // Populate Beam Wallet directly (flatten About Us submenu)
        const moveIntoAboutUs = (items) => {
          const clone = JSON.parse(JSON.stringify(items));
          const findByTitle = (list, title) => list.find(
            (x) => typeof x.title === 'string' && x.title.trim().toLowerCase() === title.trim().toLowerCase()
          );

          const beamWallet = findByTitle(clone, 'Beam Wallet');
          if (!beamWallet) return clone; // If Beam Wallet not found, do nothing
          if (!Array.isArray(beamWallet.items)) beamWallet.items = [];

          const ensureTopItem = (title, path, type = 'INTERNAL') => {
            const exists = beamWallet.items.some(
              (x) => typeof x.title === 'string' && x.title.trim().toLowerCase() === title.trim().toLowerCase()
            );
            if (!exists) {
              const item = { id: `bw-${title.toLowerCase().replace(/\s+/g, '-')}`, title, type };
              if (type === 'EXTERNAL') item.externalPath = path; else item.path = path;
              beamWallet.items.push(item);
            }
          };

          // Desired Beam Wallet submenu items (visible when clicking Beam Wallet)
          ensureTopItem('About Us', '/about-us');
          ensureTopItem('Blog', 'https://www.blog.beamwallet.com/', 'EXTERNAL');
          ensureTopItem('Recruitment', '/careers');
          ensureTopItem('Help Center', '/help-center');
          ensureTopItem('What We Offer', '/about-us');
          // Trimmed menu to match screenshot (no Beam News, Investors, Contacts at this level)

          // Ensure Recruitment is a WRAPPER and group related children under it
          let recruitment = findByTitle(beamWallet.items, 'Recruitment');
          if (!recruitment) {
            recruitment = { id: 'bw-recruitment', title: 'Recruitment', type: 'WRAPPER', items: [] };
            beamWallet.items.push(recruitment);
          } else if (recruitment && recruitment.type !== 'WRAPPER') {
            recruitment.type = 'WRAPPER';
            recruitment.items = Array.isArray(recruitment.items) ? recruitment.items : [];
          }
          if (!Array.isArray(recruitment.items)) recruitment.items = [];

          // Move Careers under Recruitment if present at the same level
          const careersIdx = beamWallet.items.findIndex(
            (it) => it && typeof it.title === 'string' && it.title.trim().toLowerCase() === 'careers'
          );
          if (careersIdx !== -1) {
            recruitment.items.push(beamWallet.items[careersIdx]);
            beamWallet.items.splice(careersIdx, 1);
          }

          // Ensure Careers exists under Recruitment
          const hasCareers = recruitment.items.some(
            (it) => it && typeof it.title === 'string' && it.title.trim().toLowerCase() === 'careers'
          );
          if (!hasCareers) {
            recruitment.items.push({ id: 'bw-careers', title: 'Careers', type: 'INTERNAL', path: '/careers' });
          }

          // Ensure Apply item under Recruitment
          const hasApply = recruitment.items.some(
            (it) => it && typeof it.title === 'string' && it.title.trim().toLowerCase().startsWith('apply')
          );
          if (!hasApply) {
            recruitment.items.push({ id: 'bw-apply-cv', title: 'Apply: Send us your CV', type: 'INTERNAL', path: '/careers/apply' });
          }

          // If an About Us WRAPPER exists, flatten its children and remove it
          const aboutUsIdx = beamWallet.items.findIndex(
            (it) => it && typeof it.title === 'string' && it.title.trim().toLowerCase() === 'about us' && it.type === 'WRAPPER'
          );
          if (aboutUsIdx !== -1) {
            const wrapper = beamWallet.items[aboutUsIdx];
            const children = Array.isArray(wrapper.items) ? wrapper.items : [];
            children.forEach((child) => {
              const exists = beamWallet.items.some(
                (x) => typeof x.title === 'string' && x.title.trim().toLowerCase() === String(child.title || '').trim().toLowerCase()
              );
              if (!exists) beamWallet.items.push(child);
            });
            beamWallet.items.splice(aboutUsIdx, 1);
          }

          return clone;
        };

        const moved = moveIntoAboutUs(normalizedTop);
        // Ensure Projects submenu mirrors desired structure
        const ensureProjectsStructure = (items) => {
          const clone = JSON.parse(JSON.stringify(items));
          const findByTitle = (list, title) => list.find(
            (x) => typeof x.title === 'string' && x.title.trim().toLowerCase() === title.trim().toLowerCase()
          );

          const projects = findByTitle(clone, 'Projects');
          if (!projects) return clone;
          if (!Array.isArray(projects.items)) projects.items = [];

          const ensureItem = (title, path, type = 'INTERNAL') => {
            const exists = projects.items.some(
              (x) => typeof x.title === 'string' && x.title.trim().toLowerCase() === title.trim().toLowerCase()
            );
            if (!exists) {
              const item = { id: `pr-${title.toLowerCase().replace(/\s+/g, '-')}`, title, type };
              if (type === 'EXTERNAL') item.externalPath = path; else item.path = path;
              projects.items.push(item);
            }
          };

          // Top-level entries
          ensureItem('For Investors', '/for-investors');
          ensureItem('Beam Token Info', 'https://ico.beamwallet.com/', 'EXTERNAL');
          ensureItem('Buy Tokens', '/investors-form');

          // Technology Partners submenu
          let techPartners = findByTitle(projects.items, 'For Technology Partners');
          if (!techPartners) {
            techPartners = { id: 'pr-for-technology-partners', title: 'For Technology Partners', type: 'WRAPPER', items: [] };
            projects.items.push(techPartners);
          } else if (techPartners && techPartners.type !== 'WRAPPER') {
            techPartners.type = 'WRAPPER';
            techPartners.items = Array.isArray(techPartners.items) ? techPartners.items : [];
          }
          if (!Array.isArray(techPartners.items)) techPartners.items = [];

          const ensureTPChild = (title, path) => {
            const exists = techPartners.items.some(
              (x) => typeof x.title === 'string' && x.title.trim().toLowerCase() === title.trim().toLowerCase()
            );
            if (!exists) techPartners.items.push({ id: `pr-tp-${title.toLowerCase().replace(/\s+/g, '-')}`, title, type: 'INTERNAL', path });
          };
          ensureTPChild('The Role of Technology Partners', '/technology-partnerships');
          ensureTPChild('Banks', '/banks');
          ensureTPChild('Software Partners', '/software-partners');
          ensureTPChild('Visionary Developers', '/visionary-developers');

          // Remaining entries
          ensureItem('Local Partners', '/local-partners');
          ensureItem('Commercial Agents', '/local-partners');
          // Ensure Buy Token/Tokens goes to participate URL
          ensureItem('Buy Token', 'https://participate.beamwallet.com/register', 'EXTERNAL');
          ensureItem('Buy Tokens', 'https://participate.beamwallet.com/register', 'EXTERNAL');

          return clone;
        };

        const afterProjects = ensureProjectsStructure(moved);
        // Ensure Affiliate Program points to external agents site across Strapi-normalized data
        ensureItem('Affiliate Program', 'https://www.agents.beamwallet.com/', 'EXTERNAL');
        // Ensure Buy Token/Tokens points to participate URL across Strapi-normalized data
        ensureItem('Buy Token', 'https://participate.beamwallet.com/register', 'EXTERNAL');
        ensureItem('Buy Tokens', 'https://participate.beamwallet.com/register', 'EXTERNAL');
        const finalNav = removeTopLevelTitles(afterProjects, ['Careers', 'Investors', 'Contacts', 'About Us', 'News', 'Blog', 'Help Center', 'Beam News']);
        setNavItems(finalNav);
      } catch (err) {
        console.error("Error fetching navigation:", err);
        setNavItems(fallbackNavItems); // Ensure navItems is an array on error
      }
    };
    fetchNav();
  }, []);

  // Toggle mobile menu state
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Close any open submenu when closing the mobile menu
    if (isMobileMenuOpen) {
      // Note: logic flipped here, close when menu *was* open
      setActiveMobileSubmenu(null);
    }
  };

  // Close mobile menu (e.g., on link click)
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setActiveMobileSubmenu(null);
  };

  // Toggle mobile submenu visibility
  const toggleMobileSubmenu = (id, e) => {
    // If provided, prevent default behavior and stop propagation
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // If it's the same ID, close it
    if (activeMobileSubmenu === id) {
      setActiveMobileSubmenu(null);
      return;
    }

    // Check if this is a parent menu or child menu
    // Convert id to string before using includes() method
    const idStr = String(id);
    if (idStr.includes("-")) {
      // This is a nested menu (contains a dash)
      // Keep it open even if parent menu changes
      setActiveMobileSubmenu(id);
    } else {
      // This is a top-level menu - close nested menus except when explicitly opening one
      setActiveMobileSubmenu(id);
    }
  };

  // Handle nested submenu click
  const handleNestedSubmenuClick = (e, id) => {
    e.preventDefault();
    e.stopPropagation();

    // Toggle the nested submenu
    if (activeMobileSubmenu === id) {
      setActiveMobileSubmenu(null);
    } else {
      setActiveMobileSubmenu(id);
    }
  };

  return (
    // Main navigation container (previously header)
    <header className={styles.navBar}>
      {" "}
      {/* Use navBar class */}
      <div className={styles.navBarContainer}>
        {" "}
        {/* Use navBarContainer class */}
        {/* Logo */}
        <Link to="/" className={styles.logo} onClick={closeMobileMenu}>
          <img src={logo} alt="Beam Wallet Logo" />
        </Link>
        {/* Desktop Navigation menu */}
        <nav className={styles.nav} id="main-nav" aria-label="Main navigation">
          <ul className={styles.navMenu}>
            {navItems &&
              navItems.map((item) => {
                // Determine link path and type
                let path = "#";
                let isExternal = item.type === "EXTERNAL";
                let target = isExternal ? "_blank" : undefined;
                let rel = isExternal ? "noopener noreferrer" : undefined;

                if (
                  item.type === "INTERNAL" &&
                  item.related &&
                  item.related.slug
                ) {
                  path = `/${item.related.slug.trim()}`;
                } else if (item.type === "EXTERNAL" && item.externalPath) {
                  path = item.externalPath.trim();
                  if (
                    !path.startsWith("http://") &&
                    !path.startsWith("https://")
                  ) {
                    path = `https://${path}`;
                  }
                } else if (item.path) {
                  // For WRAPPER or manually entered paths (usually internal by convention here)
                  path = item.path.trim();
                  path = path.startsWith("/") ? path : `/${path}`;
                  // Heuristic for WRAPPERs that might have an absolute http path manually entered
                  if (
                    item.type === "WRAPPER" &&
                    (path.startsWith("http://") || path.startsWith("https://"))
                  ) {
                    isExternal = true; // Treat as external if it looks like a full URL
                    target = "_blank";
                    rel = "noopener noreferrer";
                  }
                }

                // Check for children to render a dropdown
                const hasSubmenu = item.items && item.items.length > 0;

                return (
                  <li key={item.id || item.title} className={styles.navItem}>
                    {hasSubmenu ? (
                      <>
                        <span className={styles.navLink}>
                          {item.title.toUpperCase()}
                          <i
                            className={`fa-solid fa-chevron-down ${styles.navArrow}`}
                          ></i>
                        </span>
                        <div className={styles.dropdown}>
                          <ul className={styles.dropdownMenu}>
                            {item.items.map((subItem) => {
                              let subPath = "#";
                              let subIsExternal = subItem.type === "EXTERNAL";
                              let subTarget = subIsExternal
                                ? "_blank"
                                : undefined;
                              let subRel = subIsExternal
                                ? "noopener noreferrer"
                                : undefined;

                              if (
                                subItem.type === "INTERNAL" &&
                                subItem.related &&
                                subItem.related.slug
                              ) {
                                subPath = `/${subItem.related.slug.trim()}`;
                              } else if (
                                subItem.type === "EXTERNAL" &&
                                subItem.externalPath
                              ) {
                                subPath = subItem.externalPath.trim();
                                if (
                                  !subPath.startsWith("http://") &&
                                  !subPath.startsWith("https://")
                                ) {
                                  subPath = `https://${subPath}`;
                                }
                              } else if (subItem.path) {
                                subPath = subItem.path.trim();
                                subPath = subPath.startsWith("/")
                                  ? subPath
                                  : `/${subPath}`;
                                if (
                                  subItem.type === "WRAPPER" &&
                                  (subPath.startsWith("http://") ||
                                    subPath.startsWith("https://"))
                                ) {
                                  subIsExternal = true;
                                  subTarget = "_blank";
                                  subRel = "noopener noreferrer";
                                }
                              }

                              const hasGrandchildren =
                                subItem.items && subItem.items.length > 0;

                              return (
                                <li
                                  key={subItem.id || subItem.title}
                                  className={`${styles.dropdownItem} ${
                                    hasGrandchildren ? styles.hasSubmenu : ""
                                  }`}
                                >
                                  {hasGrandchildren ? (
                                    <>
                                      <span
                                        className={styles.dropdownLinkTrigger}
                                      >
                                        {subItem.title.toUpperCase()}
                                        <i
                                          className={`fa-solid fa-chevron-right ${styles.submenuIndicator}`}
                                        ></i>
                                      </span>
                                      <div className={styles.submenu}>
                                        <ul className={styles.submenuMenu}>
                                          {subItem.items.map(
                                            (grandchildItem) => {
                                              let grandchildPath = "#";
                                              let grandchildIsExternal =
                                                grandchildItem.type ===
                                                "EXTERNAL";
                                              let grandchildTarget =
                                                grandchildIsExternal
                                                  ? "_blank"
                                                  : undefined;
                                              let grandchildRel =
                                                grandchildIsExternal
                                                  ? "noopener noreferrer"
                                                  : undefined;

                                              if (
                                                grandchildItem.type ===
                                                  "INTERNAL" &&
                                                grandchildItem.related &&
                                                grandchildItem.related.slug
                                              ) {
                                                grandchildPath = `/${grandchildItem.related.slug.trim()}`;
                                              } else if (
                                                grandchildItem.type ===
                                                  "EXTERNAL" &&
                                                grandchildItem.externalPath
                                              ) {
                                                grandchildPath =
                                                  grandchildItem.externalPath.trim();
                                                if (
                                                  !grandchildPath.startsWith(
                                                    "http://"
                                                  ) &&
                                                  !grandchildPath.startsWith(
                                                    "https://"
                                                  )
                                                ) {
                                                  grandchildPath = `https://${grandchildPath}`;
                                                }
                                              } else if (grandchildItem.path) {
                                                grandchildPath =
                                                  grandchildItem.path.trim();
                                                grandchildPath =
                                                  grandchildPath.startsWith("/")
                                                    ? grandchildPath
                                                    : `/${grandchildPath}`;
                                                if (
                                                  grandchildItem.type ===
                                                    "WRAPPER" &&
                                                  (grandchildPath.startsWith(
                                                    "http://"
                                                  ) ||
                                                    grandchildPath.startsWith(
                                                      "https://"
                                                    ))
                                                ) {
                                                  grandchildIsExternal = true;
                                                  grandchildTarget = "_blank";
                                                  grandchildRel =
                                                    "noopener noreferrer";
                                                }
                                              }

                                              return (
                                                <li
                                                  key={
                                                    grandchildItem.id ||
                                                    grandchildItem.title
                                                  }
                                                  className={styles.submenuItem}
                                                >
                                                  {grandchildIsExternal ? (
                                                    <a
                                                      href={grandchildPath}
                                                      className={
                                                        styles.submenuLink
                                                      }
                                                      target={grandchildTarget}
                                                      rel={grandchildRel}
                                                    >
                                                      {grandchildItem.title.toUpperCase()}
                                                    </a>
                                                  ) : (
                                                    <Link
                                                      to={grandchildPath}
                                                      className={
                                                        styles.submenuLink
                                                      }
                                                    >
                                                      {grandchildItem.title.toUpperCase()}
                                                    </Link>
                                                  )}
                                                </li>
                                              );
                                            }
                                          )}
                                        </ul>
                                      </div>
                                    </>
                                  ) : subIsExternal ? (
                                    <a
                                      href={subPath}
                                      className={styles.dropdownLink}
                                      target={subTarget}
                                      rel={subRel}
                                    >
                                      {subItem.title.toUpperCase()}
                                    </a>
                                  ) : (
                                    <Link
                                      to={subPath}
                                      className={styles.dropdownLink}
                                    >
                                      {subItem.title.toUpperCase()}
                                    </Link>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </>
                    ) : isExternal ? (
                      <a
                        href={path}
                        className={styles.navLink}
                        target={target}
                        rel={rel}
                      >
                        {item.title.toUpperCase()}
                      </a>
                    ) : (
                      <Link to={path} className={styles.navLink}>
                        {item.title.toUpperCase()}
                      </Link>
                    )}
                  </li>
                );
              })}
          </ul>
        </nav>
        {/* App download buttons */}
        <div className={styles.appButtons}>
          <a
            href="https://apps.apple.com/au/app/beam/id560637969"
            className={styles.appButton}
            aria-label="Download on App Store"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={appStore} alt="Download on App Store" />
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=com.beamwallet&hl=en"
            className={styles.appButton}
            aria-label="Get it on Google Play"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={googlePlay} alt="Get it on Google Play" />
          </a>
        </div>
        {/* Mobile Menu Button */}
        <button
          className={styles.mobileMenuButton}
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-nav"
        >
          <span className={isMobileMenuOpen ? styles.open : ""}></span>
          <span className={isMobileMenuOpen ? styles.open : ""}></span>
          <span className={isMobileMenuOpen ? styles.open : ""}></span>
        </button>
      </div>
      {/* Mobile menu overlay */}
      <div
        className={`${styles.mobileNavOverlay} ${
          isMobileMenuOpen ? styles.open : ""
        }`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      ></div>
      {/* Mobile Navigation Menu */}
      <div
        className={`${styles.mobileNav} ${isMobileMenuOpen ? styles.open : ""}`}
        id="mobile-nav"
        onClick={(e) => e.stopPropagation()} // Stop clicks from propagating
      >
        <nav aria-label="Mobile navigation">
          <ul className={styles.mobileNavMenu}>
            {navItems &&
              navItems.map((item) => {
                // Determine link path and type for top-level items
                let path = "#";
                let isExternal = item.type === "EXTERNAL";
                let target = isExternal ? "_blank" : undefined;
                let rel = isExternal ? "noopener noreferrer" : undefined;

                if (
                  item.type === "INTERNAL" &&
                  item.related &&
                  item.related.slug
                ) {
                  path = `/${item.related.slug.trim()}`;
                } else if (item.type === "EXTERNAL" && item.externalPath) {
                  path = item.externalPath.trim();
                  if (
                    !path.startsWith("http://") &&
                    !path.startsWith("https://")
                  ) {
                    path = `https://${path}`;
                  }
                } else if (item.path) {
                  path = item.path.trim();
                  path = path.startsWith("/") ? path : `/${path}`;
                  if (
                    item.type === "WRAPPER" &&
                    (path.startsWith("http://") || path.startsWith("https://"))
                  ) {
                    isExternal = true;
                    target = "_blank";
                    rel = "noopener noreferrer";
                  }
                }

                const hasSubmenu = item.items && item.items.length > 0;
                const itemSubmenuId = `mobile-sub-${item.id || item.title}`;

                return (
                  <li
                    key={item.id || item.title}
                    className={styles.mobileNavItem}
                  >
                    {hasSubmenu ? (
                      <>
                        <span
                          className={styles.mobileNavLink}
                          onClick={(e) => toggleMobileSubmenu(itemSubmenuId, e)}
                        >
                          {item.title.toUpperCase()}
                          <i
                            className={`fa-solid ${
                              activeMobileSubmenu === itemSubmenuId
                                ? "fa-chevron-down"
                                : "fa-chevron-right"
                            } ${styles.mobileNavArrow}`}
                          ></i>
                        </span>
                        <ul
                          className={`${styles.mobileSubMenu} ${
                            activeMobileSubmenu === itemSubmenuId ||
                            (activeMobileSubmenu &&
                              String(activeMobileSubmenu).startsWith(
                                `${itemSubmenuId}-`
                              ))
                              ? styles.active
                              : ""
                          }`}
                        >
                          {item.items.map((subItem) => {
                            let subPath = "#";
                            let subIsExternal = subItem.type === "EXTERNAL";
                            let subTarget = subIsExternal
                              ? "_blank"
                              : undefined;
                            let subRel = subIsExternal
                              ? "noopener noreferrer"
                              : undefined;

                            if (
                              subItem.type === "INTERNAL" &&
                              subItem.related &&
                              subItem.related.slug
                            ) {
                              subPath = `/${subItem.related.slug.trim()}`;
                            } else if (
                              subItem.type === "EXTERNAL" &&
                              subItem.externalPath
                            ) {
                              subPath = subItem.externalPath.trim();
                              if (
                                !subPath.startsWith("http://") &&
                                !subPath.startsWith("https://")
                              ) {
                                subPath = `https://${subPath}`;
                              }
                            } else if (subItem.path) {
                              subPath = subItem.path.trim();
                              subPath = subPath.startsWith("/")
                                ? subPath
                                : `/${subPath}`;
                              if (
                                subItem.type === "WRAPPER" &&
                                (subPath.startsWith("http://") ||
                                  subPath.startsWith("https://"))
                              ) {
                                subIsExternal = true;
                                subTarget = "_blank";
                                subRel = "noopener noreferrer";
                              }
                            }

                            const hasGrandchildren =
                              subItem.items && subItem.items.length > 0;
                            const subItemNestedMenuId = `${itemSubmenuId}-${
                              subItem.id || subItem.title
                            }`;

                            return (
                              <li key={subItem.id || subItem.title}>
                                {hasGrandchildren ? (
                                  <>
                                    <span
                                      className={styles.mobileSubLink}
                                      onClick={(e) =>
                                        handleNestedSubmenuClick(
                                          e,
                                          subItemNestedMenuId
                                        )
                                      }
                                    >
                                      {subItem.title.toUpperCase()}
                                      <i
                                        className={`fa-solid ${
                                          activeMobileSubmenu ===
                                          subItemNestedMenuId
                                            ? "fa-chevron-down"
                                            : "fa-chevron-right"
                                        } ${styles.mobileNavArrow}`}
                                      ></i>
                                    </span>
                                    <ul
                                      className={`${styles.mobileNestedMenu} ${
                                        activeMobileSubmenu ===
                                        subItemNestedMenuId
                                          ? styles.active
                                          : ""
                                      }`}
                                    >
                                      {subItem.items.map((grandchildItem) => {
                                        let grandchildPath = "#";
                                        let grandchildIsExternal =
                                          grandchildItem.type === "EXTERNAL";
                                        let grandchildTarget =
                                          grandchildIsExternal
                                            ? "_blank"
                                            : undefined;
                                        let grandchildRel = grandchildIsExternal
                                          ? "noopener noreferrer"
                                          : undefined;

                                        if (
                                          grandchildItem.type === "INTERNAL" &&
                                          grandchildItem.related &&
                                          grandchildItem.related.slug
                                        ) {
                                          grandchildPath = `/${grandchildItem.related.slug.trim()}`;
                                        } else if (
                                          grandchildItem.type === "EXTERNAL" &&
                                          grandchildItem.externalPath
                                        ) {
                                          grandchildPath =
                                            grandchildItem.externalPath.trim();
                                          if (
                                            !grandchildPath.startsWith(
                                              "http://"
                                            ) &&
                                            !grandchildPath.startsWith(
                                              "https://"
                                            )
                                          ) {
                                            grandchildPath = `https://${grandchildPath}`;
                                          }
                                        } else if (grandchildItem.path) {
                                          grandchildPath =
                                            grandchildItem.path.trim();
                                          grandchildPath =
                                            grandchildPath.startsWith("/")
                                              ? grandchildPath
                                              : `/${grandchildPath}`;
                                          if (
                                            grandchildItem.type === "WRAPPER" &&
                                            (grandchildPath.startsWith(
                                              "http://"
                                            ) ||
                                              grandchildPath.startsWith(
                                                "https://"
                                              ))
                                          ) {
                                            grandchildIsExternal = true;
                                            grandchildTarget = "_blank";
                                            grandchildRel =
                                              "noopener noreferrer";
                                          }
                                        }
                                        return (
                                          <li
                                            key={
                                              grandchildItem.id ||
                                              grandchildItem.title
                                            }
                                          >
                                            {grandchildIsExternal ? (
                                              <a
                                                href={grandchildPath}
                                                target={grandchildTarget}
                                                rel={grandchildRel}
                                                className={
                                                  styles.mobileNestedLink
                                                }
                                                onClick={closeMobileMenu}
                                              >
                                                {grandchildItem.title.toUpperCase()}
                                              </a>
                                            ) : (
                                              <Link
                                                to={grandchildPath}
                                                className={
                                                  styles.mobileNestedLink
                                                }
                                                onClick={closeMobileMenu}
                                              >
                                                {grandchildItem.title.toUpperCase()}
                                              </Link>
                                            )}
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  </>
                                ) : subIsExternal ? (
                                  <a
                                    href={subPath}
                                    target={subTarget}
                                    rel={subRel}
                                    className={styles.mobileSubLink}
                                    onClick={closeMobileMenu}
                                  >
                                    {subItem.title.toUpperCase()}
                                  </a>
                                ) : (
                                  <Link
                                    to={subPath}
                                    className={styles.mobileSubLink}
                                    onClick={closeMobileMenu}
                                  >
                                    {subItem.title.toUpperCase()}
                                  </Link>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </>
                    ) : isExternal ? (
                      <a
                        href={path}
                        className={styles.mobileNavLink}
                        target={target}
                        rel={rel}
                        onClick={closeMobileMenu}
                      >
                        {item.title.toUpperCase()}
                      </a>
                    ) : (
                      <Link
                        to={path}
                        className={styles.mobileNavLink}
                        onClick={closeMobileMenu}
                      >
                        {item.title.toUpperCase()}
                      </Link>
                    )}
                  </li>
                );
              })}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default NavBar;
