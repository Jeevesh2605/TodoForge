import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LINK_CLASSES, menuItems, PRODUCTIVITY_CARD, SIDEBAR_CLASSES, TIP_CARD } from '../assets/dummy.jsx';
import { Lightbulb, Sparkles, Menu, X } from 'lucide-react';

const Sidebar = ({ user }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productivity] = useState(75);
  
  const username = user?.name || "User";
  const initial = username.charAt(0).toUpperCase();

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  const renderMenuItems = (isMobile = false) => (
    <ul className="space-y-2">
      {menuItems.map(({ text, path, icon }) => (
        <li key={text}>
          <NavLink
            to={path}
            className={({ isActive }) => [
              LINK_CLASSES.base,
              isActive ? LINK_CLASSES.active : LINK_CLASSES.inactive,
              isMobile ? "justify-start" : "lg:justify-start"
            ].join(" ")}
            onClick={closeMobile}
          >
            <span className={LINK_CLASSES.icon}>{icon}</span>
            <span className={`${isMobile ? "block" : "hidden lg:block"} ${LINK_CLASSES.text}`}>
              {text}
            </span>
          </NavLink>
        </li>
      ))}
    </ul>
  );

  const UserInfo = ({ isMobile = false }) => (
    <div className={`flex items-center gap-3 ${isMobile ? "mb-6" : ""}`}>
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
        {initial}
      </div>
      <div>
        <h2 className="text-lg font-bold text-gray-800">Hey, {username}</h2>
        <p className="text-xs text-purple-500 font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Let's crush some tasks!
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <div className={SIDEBAR_CLASSES.desktop}>
        <div className="p-5 border-b border-purple-100">
          <UserInfo />
        </div>
        <div className="p-4 space-y-6 overflow-y-auto flex-1">
          <div className={PRODUCTIVITY_CARD.container}>
            <div className={PRODUCTIVITY_CARD.header}>
              <h3 className={PRODUCTIVITY_CARD.label}>PRODUCTIVITY</h3>
              <span className={PRODUCTIVITY_CARD.badge}>{productivity}%</span>
            </div>
            <div className={PRODUCTIVITY_CARD.barBg}>
              <div
                className={PRODUCTIVITY_CARD.barFg}
                style={{ width: `${productivity}%` }}
              />
            </div>
          </div>
          {renderMenuItems()}
          <div className="mt-auto pt-4 lg:block hidden">
            <div className={TIP_CARD.container}>
              <div className="flex items-center gap-2">
                <div className={TIP_CARD.iconWrapper}>
                  <Lightbulb className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className={TIP_CARD.title}>Pro Tip</h3>
                  <p className={TIP_CARD.text}>Use keyboard shortcuts to boost productivity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE MENU BUTTON */}
      {!mobileOpen && (
        <button onClick={() => setMobileOpen(true)} className={SIDEBAR_CLASSES.mobileButton}>
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* MOBILE DRAWER */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40">
          <div className={SIDEBAR_CLASSES.mobileDrawerBackdrop} onClick={closeMobile} />
          <div className={SIDEBAR_CLASSES.mobileDrawer} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-lg font-bold text-purple-600">Menu</h2>
              <button onClick={closeMobile} className="text-gray-700 hover:text-purple-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <UserInfo isMobile />
            {renderMenuItems(true)}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;