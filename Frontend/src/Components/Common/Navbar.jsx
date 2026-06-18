import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

import {
  FiSearch,
  FiShoppingBag,
  FiUser,
  FiMenu,
  FiX,
} from "react-icons/fi";

import logo from "../../assets/Naarisa logo icon.png";

const navLinks = [
  {
    title: "SHOP ALL",
    path: "/all-products",
  },
  {
    title: "NEW IN",
    path: "/new-in",
  },
  {
    title: "CATEGORIES",
    dropdown: [
      {
        title: "Short Kurti",
        path: "/categories/short-kurtis",
      },
      {
        title: "Long Kurti",
        path: "/categories/long-kurtis",
      },
      {
        title: "Kurti Sets",
        path: "/categories/kurti-sets",
      },
      {
        title: "Dresses",
        path: "/categories/dresses",
      },
    ],
  },
  {
    title: "BEST SELLERS",
    path: "/best-sellers",
  },
  {
    title: "OUR STORY",
    path: "/about",
  },
];

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false);

  return (
    <>
      {/* NAVBAR */}
      <header
        className="
        sticky
        top-0
        z-50
        w-full
        border-b
        border-[#e8ddd0]
        bg-[#f6ece2]/90
        backdrop-blur-md
      "
      >
        <div
          className="
          relative
          mx-auto
          flex
          h-[92px]
          max-w-[1400px]
          items-center
          justify-between
          px-5
          sm:px-6
          md:h-[94px]
          md:px-10
          xl:h-[82px]
          xl:px-12
        "
        >
          {/* LEFT SIDE */}
          <div className="flex items-center lg:gap-6">

            {/* MOBILE MENU */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="
              flex
              items-center
              justify-center
              text-[30px]
              text-[#1f1b15]
              lg:hidden
            "
            >
              <FiMenu />
            </button>

            {/* DESKTOP LOGO */}
            <Link
              to="/"
              className="
              hidden
              transition-transform
              duration-300
              hover:scale-[1.03]
              lg:flex
            "
            >
              <img
                src={logo}
                alt="Naarisa"
                className="
                  h-14
                  w-auto
                  object-contain
                  xl:h-12
                "
              />
            </Link>
          </div>

          {/* MOBILE/TABLET CENTER LOGO */}
          <Link
            to="/"
            className="
            absolute
            left-1/2
            top-1/2
            flex
            -translate-x-1/2
            -translate-y-1/2
            items-center
            justify-center
            transition-transform
            duration-300
            hover:scale-[1.03]
            lg:hidden
          "
          >
            <img
              src={logo}
              alt="Naarisa"
              className="
                h-14
                w-auto
                object-contain
                md:h-16
              "
            />
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden flex-1 justify-center lg:flex">
            <ul
              className="
              flex
              items-center
              gap-5
              xl:gap-8
              2xl:gap-12
            "
            >
              {navLinks.map((link, index) => (
                <li
                  key={index}
                  className="group relative"
                >
                  {!link.dropdown ? (
                    <NavLink
                      to={link.path}
                      className={({ isActive }) =>
                        `
                        relative
                        font-['Jost']
                        text-[13px]
                        xl:text-[14px]
                        2xl:text-[15px]
                        font-normal
                        tracking-[0.14em]
                        transition-all
                        duration-300
                        ${isActive
                          ? "text-[#7c5400]"
                          : "text-[#504537] hover:text-[#7c5400]"
                        }
                      `
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {link.title}

                          <span
                            className={`
                              absolute
                              left-0
                              -bottom-[8px]
                              h-[1px]
                              bg-[#7c5400]
                              transition-all
                              duration-300
                              ${isActive
                                ? "w-full"
                                : "w-0 group-hover:w-full"
                              }
                            `}
                          />
                        </>
                      )}
                    </NavLink>
                  ) : (
                    <>
                      {/* DROPDOWN BUTTON */}
                      <button
                        className="
                        relative
                        font-['Jost']
                        text-[13px]
                        xl:text-[14px]
                        2xl:text-[15px]
                        font-normal
                        tracking-[0.14em]
                        text-[#504537]
                        transition-all
                        duration-300
                        hover:text-[#7c5400]
                      "
                      >
                        {link.title}

                        <span
                          className="
                          absolute
                          left-0
                          -bottom-[8px]
                          h-[1px]
                          w-0
                          bg-[#7c5400]
                          transition-all
                          duration-300
                          group-hover:w-full
                        "
                        />
                      </button>

                      {/* DROPDOWN MENU */}
                      <div
                        className="
                        invisible
                        absolute
                        left-1/2
                        top-[180%]
                        z-50
                        w-[240px]
                        -translate-x-1/2
                        rounded-[12px]
                        border
                        border-[#eadcc8]
                        bg-[#fff8f3]
                        p-3
                        opacity-0
                        shadow-[0_8px_30px_rgba(30,26,20,0.08)]
                        transition-all
                        duration-300
                        group-hover:visible
                        group-hover:opacity-100
                      "
                      >
                        <div className="flex flex-col">
                          {link.dropdown.map((item, idx) => (
                            <Link
                              key={idx}
                              to={item.path}
                              className="
                              rounded-[8px]
                              px-4
                              py-3
                              font-['Jost']
                              text-[15px]
                              text-[#504537]
                              transition-all
                              duration-300
                              hover:bg-[#f6ece2]
                              hover:text-[#7c5400]
                            "
                            >
                              {item.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4 sm:gap-5">

            {/* SEARCH */}
            <button
              className="
              flex
              items-center
              justify-center
              text-[22px]
              text-[#1f1b15]
              transition
              duration-300
              hover:text-[#7c5400]
              md:text-[23px]
              xl:text-[20px]
            "
            >
              <FiSearch />
            </button>

            {/* CART */}
            <Link
              to="/cart"
              className="
              flex
              items-center
              justify-center
              text-[22px]
              text-[#1f1b15]
              transition
              duration-300
              hover:text-[#7c5400]
              md:text-[23px]
              xl:text-[20px]
            "
            >
              <FiShoppingBag />
            </Link>

            {/* USER */}
            <Link
              to="/account"
              className="
              flex
              items-center
              justify-center
              text-[22px]
              text-[#1f1b15]
              transition
              duration-300
              hover:text-[#7c5400]
              md:text-[23px]
              xl:text-[20px]
            "
            >
              <FiUser />
            </Link>
          </div>
        </div>
      </header>

      {/* MOBILE OVERLAY */}
      <div
        onClick={() => setMobileMenuOpen(false)}
        className={`
          fixed
          inset-0
          z-40
          bg-black/30
          transition-opacity
          duration-300
          lg:hidden
          ${mobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
          }
        `}
      />

      {/* MOBILE MENU */}
      <div
        className={`
          fixed
          top-0
          left-0
          z-50
          h-screen
          w-[92%]
          max-w-[400px]
          bg-[#fff8f3]
          px-7
          py-8
          transition-transform
          duration-300
          lg:hidden
          ${mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full"
          }
        `}
      >
        {/* MOBILE HEADER */}
        <div className="mb-14 flex items-center justify-between">

          <div
            className="
            flex
            items-center
            justify-center
            rounded-full
            border
            border-[#eadcc8]
            bg-[#fff8f3]
            p-2
            shadow-[0_2px_12px_rgba(30,26,20,0.05)]
          "
          >
            <img
              src={logo}
              alt="Naarisa"
              className="
              h-12
              w-auto
              object-contain
            "
            />
          </div>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="
            flex
            items-center
            justify-center
            text-[30px]
            text-[#1f1b15]
          "
          >
            <FiX />
          </button>
        </div>

        {/* MOBILE NAVIGATION */}
        <ul className="flex flex-col gap-10">
          {navLinks.map((link, index) => (
            <li key={index}>
              {!link.dropdown ? (
                <NavLink
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `
                    group
                    relative
                    inline-block
                    font-['Jost']
                    text-[18px]
                    sm:text-[19px]
                    font-medium
                    tracking-[0.12em]
                    transition-all
                    duration-300
                    ${isActive
                      ? "text-[#7c5400]"
                      : "text-[#504537] hover:text-[#7c5400]"
                    }
                  `
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.title}

                      <span
                        className={`
                          absolute
                          left-0
                          -bottom-[6px]
                          h-[1px]
                          bg-[#7c5400]
                          transition-all
                          duration-300
                          ${isActive
                            ? "w-full"
                            : "w-0 group-hover:w-full"
                          }
                        `}
                      />
                    </>
                  )}
                </NavLink>
              ) : (
                <div className="flex flex-col">

                  {/* CATEGORY BUTTON */}
                  <button
                    onClick={() =>
                      setMobileCategoryOpen(!mobileCategoryOpen)
                    }
                    className="
                    flex
                    items-center
                    justify-between
                    font-['Jost']
                    text-[18px]
                    sm:text-[19px]
                    font-normal
                    tracking-[0.12em]
                    text-[#1f1b15]
                  "
                  >
                    {link.title}

                    <span
                      className={`
                        text-[18px]
                        transition-transform
                        duration-300
                        ${mobileCategoryOpen
                          ? "rotate-45"
                          : ""
                        }
                      `}
                    >
                      +
                    </span>
                  </button>

                  {/* MOBILE DROPDOWN */}
                  <div
                    className={`
                      overflow-hidden
                      transition-all
                      duration-300
                      ${mobileCategoryOpen
                        ? "max-h-[300px] opacity-100"
                        : "max-h-0 opacity-0"
                      }
                    `}
                  >
                    <div className="ml-3 mt-5 flex flex-col gap-4">
                      {link.dropdown.map((item, idx) => (
                        <Link
                          key={idx}
                          to={item.path}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setMobileCategoryOpen(false);
                          }}
                          className="
                          font-['Jost']
                          text-[16px]
                          text-[#504537]
                          transition-all
                          duration-300
                          hover:text-[#7c5400]
                        "
                        >
                          {item.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Navbar;