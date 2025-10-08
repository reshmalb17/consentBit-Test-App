import React, { useEffect, useRef, useState } from "react";
import iro from "@jaames/iro"; // Import iro.js
import { getAlignmentIcon, getBannerStyleIcon } from "../util/optimized-images";

const justiflyleft = new URL("../assets/left align uncheck.svg", import.meta.url).href;
const justiflycenter = new URL("../assets/center align uncheck.svg", import.meta.url).href;
const justiflyright = new URL("../assets/right align uncheckd.svg", import.meta.url).href;

const dots = new URL("../assets/3 dots.svg", import.meta.url).href;
const line = new URL("../assets/Vector 20.svg", import.meta.url).href;
const questionmark = new URL("../assets/question.svg", import.meta.url).href;
const logo = new URL("../assets/icon.svg", import.meta.url).href;
const checkedcenteralign = new URL("../assets/center alignemnt checked.svg", import.meta.url).href;
const checkedleft = new URL("../assets/left checkd alignment.svg", import.meta.url).href;
const checkedright = new URL("../assets/right checkd alignemnt.svg", import.meta.url).href;


type Orientation = "left" | "center" | "right";
type BannerStyle = "align" | "alignstyle" | "bigstyle" | "centeralign" | "fullwidth" | "";

interface CustomizationProps {
  animation: string;
  setAnimation: (value: string) => void;
  easing: string;
  setEasing: (value: string) => void;
  language: string;
  setLanguage: (value: string) => void;
  weight: string;
  SetWeight: (value: string) => void;
  size: string;
  SetSize: (value: string) => void;
  selected: Orientation;
  setSelected: React.Dispatch<React.SetStateAction<Orientation>>;
  Font: string;
  SetFont: (value: string) => void;
  selectedtext: "left" | "center" | "right";
  settextSelected: (value: "left" | "center" | "right") => void;
  style: BannerStyle;
  setStyle: React.Dispatch<React.SetStateAction<BannerStyle>>;
  borderRadius: number;
  setBorderRadius: (value: number) => void;
  buttonRadius: number;
  setButtonRadius: (value: number) => void;
  color: string;
  setColor: (value: string) => void;
  bgColor: string;
  setBgColor: (value: string) => void;
  btnColor: string;
  setBtnColor: (value: string) => void;
  headColor: string;
  setHeadColor: (value: string) => void;
  paraColor: string;
  setParaColor: (value: string) => void;
  secondcolor: string;
  setSecondcolor: (value: string) => void;
  bgColors: string;
  setBgColors: (value: string) => void;
  secondbuttontext: string;
  setsecondbuttontext: (value: string) => void;
  primaryButtonText: string;
  setPrimaryButtonText: (value: string) => void;
  closebutton: boolean;
  privacyUrl: string;
  setPrivacyUrl: (value: string) => void;
}

const Customization: React.FC<CustomizationProps> = ({
  animation,
  setAnimation,
  easing,
  setEasing,
  language,
  setLanguage,
  weight,
  SetWeight,
  size,
  SetSize,
  selected,
  setSelected,
  Font,
  SetFont,
  selectedtext,
  settextSelected,
  style,
  setStyle,
  buttonRadius,
  setButtonRadius,
  borderRadius,
  setBorderRadius,
  color,
  setColor,
  bgColor,
  setBgColor,
  btnColor,
  setBtnColor,
  headColor,
  setHeadColor,
  paraColor,
  setParaColor,
  secondcolor,
  setSecondcolor,
  bgColors,
  setBgColors,
  secondbuttontext,
  setsecondbuttontext,
  primaryButtonText,
  setPrimaryButtonText,
  closebutton,
  privacyUrl,
  setPrivacyUrl,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showDiv, setShowDiv] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement | null>(null);
  const pickerInstance = useRef<any>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  
  // Custom dropdown states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRefs = {
    font: useRef<HTMLDivElement>(null),
    weight: useRef<HTMLDivElement>(null),
    size: useRef<HTMLDivElement>(null),
  };

  // Dropdown options
  const fontOptions = [
    { label: "Montserrat", value: "'Montserrat', sans-serif" },
    { label: "Lato", value: "'Lato', sans-serif" },
    { label: "Oswald", value: "'Oswald', sans-serif" },
    { label: "Merriweather", value: "'Merriweather', serif" },
    { label: "Open Sans", value: "'Open Sans', sans-serif" },
    { label: "Ubuntu", value: "'Ubuntu', sans-serif" },
    { label: "Droid Sans", value: "'Droid Sans', sans-serif" },
    { label: "Exo", value: "'Exo', sans-serif" },
  ];

  const weightOptions = [
    { label: "Semibold", value: "600" },
    { label: "Thin", value: "100" },
    { label: "Light", value: "300" },
    { label: "Regular", value: "400" },
    { label: "Bold", value: "700" },
    { label: "Extra Bold", value: "800" },
  ];

  const sizeOptions = [
    { label: "12px", value: "12" },
    { label: "13px", value: "13" },
    { label: "14px", value: "14" },
    { label: "15px", value: "15" },
    { label: "16px", value: "16" },
    { label: "17px", value: "17" },
    { label: "18px", value: "18" },
  ];

  const tooltips = {
    font: "Select the font family for the cookie banner text.",
    weight: "Choose the font weight to control text thickness.",
    size: "Adjust the font size for better readability.",
  };

  const getLabel = (opts: any[], val: string) =>
    (opts.find((o) => o.value === val) || {}).label || val;

  // Handle click outside for custom dropdowns
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      Object.entries(dropdownRefs).forEach(([key, ref]) => {
        if (ref.current && !ref.current.contains(e.target as Node)) {
          if (openDropdown === key) setOpenDropdown(null);
        }
      });
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  const renderDropdown = (
    type: "font" | "weight" | "size",
    label: string,
    value: string,
    options: any[],
    onPick: (val: string) => void,
    showLabel: boolean = true
  ) => (
    <div className="settings-group">
      {showLabel && (
        <div className="flex">
          <label>{label}</label>
          <div className="tooltip-container">
            <img src={questionmark} alt="info" className="tooltip-icon" />
            <span className="tooltip-text">{tooltips[type]}</span>
          </div>
        </div>
      )}

      <div className={`custom-select ${type === "size" ? "size-dropdown" : ""} ${openDropdown === type ? "open" : ""}`} ref={dropdownRefs[type]}>
        <div
          className="selected"
          onClick={() =>
            setOpenDropdown(openDropdown === type ? null : type)
          }
        >
          <span>{getLabel(options, value)}</span>
          <svg className="dropdown-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {openDropdown === type && (
          <ul className="options">
            {options.map((opt) => (
              <li
                key={opt.value}
                onClick={() => {
                  onPick(opt.value);
                  setOpenDropdown(null);
                }}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );


  const [btnOpen, setBtnOpen] = useState(false);
  const [headOpen, setHeadOpen] = useState(false);
  const [paraOpen, setParaOpen] = useState(false);
  const [secondbuttonOpen, setSecondButtonOpen] = useState(false);
  const [secondbgOpen, setSecondbgopen] = useState(false)
  const [SecondbuttonTextOpen, setSecondbuttonTextOpen] = useState(false)
  const [primaryButtonTextOpen, setPrimaryButtonTextOpen] = useState(false);



  const btnPickerRef = useRef<HTMLDivElement | null>(null);
  const headPickerRef = useRef<HTMLDivElement | null>(null);
  const paraPickerRef = useRef<HTMLDivElement | null>(null);
  const secondbtnPickerRef = useRef<HTMLDivElement | null>(null);
  const secondbgPickerRef = useRef<HTMLDivElement | null>(null);
  const SecondbuttonTextPickerRef = useRef<HTMLDivElement | null>(null);
  const primaryButtonTextPickerRef = useRef<HTMLDivElement>(null);


  const btnPickerInstance = useRef<any>(null);
  const headPickerInstance = useRef<any>(null);
  const paraPickerInstance = useRef<any>(null);
  const secondbtnPickerInstance = useRef<any>(null);
  const secondbgPickerInstance = useRef<any>(null);
  const SecondbuttonTextInstance = useRef<any>(null);
  const primaryButtonTextInstance = useRef<iro.ColorPicker | null>(null);


  const btnDropdownRef = useRef<HTMLDivElement | null>(null);
  const headDropdownRef = useRef<HTMLDivElement | null>(null);
  const paraDropdownRef = useRef<HTMLDivElement | null>(null);
  const secondbtnDropdownRef = useRef<HTMLDivElement | null>(null);
  const secondbgDropdownRef = useRef<HTMLDivElement | null>(null);
  const secondbuttonDropdownRef = useRef<HTMLDivElement | null>(null);
  const primaryButtonTextDropdownRef = useRef<HTMLDivElement>(null);


  const handleBorderRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBorderRadius(Number(e.target.value));
  };

  const handleButtonRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setButtonRadius(Number(e.target.value));
  };

  useEffect(() => {
    setIsActive(false);
    setTimeout(() => setIsActive(true), 50);
  }, [animation]);

  useEffect(() => {
    document.body.style.fontFamily = Font;
  }, [Font]);

  useEffect(() => {
    if (!pickerInstance.current && colorPickerRef.current) {
      pickerInstance.current = iro.ColorPicker(colorPickerRef.current, {
        width: 100,
        color: color,
        borderWidth: 2,
        borderColor: "#ccc",
      });

      pickerInstance.current.on("color:change", (newColor: any) => {
        setColor(newColor.hexString);
      });
    } else {
    }
  }, []);

  useEffect(() => {
    if (isOpen && pickerInstance.current) {
      pickerInstance.current.color.set(color);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const previewDimensions = React.useMemo(() => {
    switch (style) {
      case "bigstyle":
        return { width: "250px", minHeight: "151px" };
      case "fullwidth":
        return { width: "448px", dislay: "flex" };
      case "centeralign":
        return { width: "303px" };
      default:
        return { width: "318px" };
    }
  }, [style]);
  // ---

  useEffect(() => {
    // Initialize all color pickers

    if (!btnPickerInstance.current && btnPickerRef.current) {
      btnPickerInstance.current = iro.ColorPicker(btnPickerRef.current, { width: 100, color: btnColor, borderWidth: 2, borderColor: "#ccc" });
      btnPickerInstance.current.on("color:change", (newColor: any) => setBtnColor(newColor.hexString));
    }
    if (!headPickerInstance.current && headPickerRef.current) {
      headPickerInstance.current = iro.ColorPicker(headPickerRef.current, { width: 100, color: headColor, borderWidth: 2, borderColor: "#ccc" });
      headPickerInstance.current.on("color:change", (newColor: any) => setHeadColor(newColor.hexString));
    }
    if (!paraPickerInstance.current && paraPickerRef.current) {
      paraPickerInstance.current = iro.ColorPicker(paraPickerRef.current, { width: 100, color: paraColor, borderWidth: 2, borderColor: "#ccc" });
      paraPickerInstance.current.on("color:change", (newColor: any) => setParaColor(newColor.hexString));
    }
    if (!secondbtnPickerInstance.current && secondbtnPickerRef.current) {
      secondbtnPickerInstance.current = iro.ColorPicker(secondbtnPickerRef.current, { width: 100, color: secondcolor, borderWidth: 2, borderColor: "#ccc" });
      secondbtnPickerInstance.current.on("color:change", (newColor: any) => setSecondcolor(newColor.hexString));
    }
    if (!secondbgPickerInstance.current && secondbgPickerRef.current) {
      secondbgPickerInstance.current = iro.ColorPicker(secondbgPickerRef.current, { width: 100, color: bgColors, borderWidth: 2, borderColor: "#ccc" });
      secondbgPickerInstance.current.on("color:change", (newColor: any) => setBgColors(newColor.hexString));
    }
    if (!SecondbuttonTextInstance.current && SecondbuttonTextPickerRef.current) {
      SecondbuttonTextInstance.current = iro.ColorPicker(SecondbuttonTextPickerRef.current, { width: 100, color: secondbuttontext, borderWidth: 2, borderColor: "#ccc" });
      SecondbuttonTextInstance.current.on("color:change", (newColor: any) => setsecondbuttontext(newColor.hexString));
    }
    if (!primaryButtonTextInstance.current && primaryButtonTextPickerRef.current) {
      primaryButtonTextInstance.current = iro.ColorPicker(primaryButtonTextPickerRef.current, { width: 100, color: primaryButtonText, borderWidth: 2, borderColor: "#ccc" });
      primaryButtonTextInstance.current.on("color:change", (newColor: any) => setPrimaryButtonText(newColor.hexString));
    }
  }, []);

  useEffect(() => {
    // Sync picker color with state when dropdown opens
    if (btnOpen && btnPickerInstance.current) btnPickerInstance.current.color.set(btnColor);
    if (headOpen && headPickerInstance.current) headPickerInstance.current.color.set(headColor);
    if (paraOpen && paraPickerInstance.current) paraPickerInstance.current.color.set(paraColor);
    if (secondbuttonOpen && secondbtnPickerInstance.current) secondbtnPickerInstance.current.color.set(secondcolor);
    if (secondbgOpen && secondbgPickerInstance.current) secondbgPickerInstance.current.color.set(bgColors);
    if (SecondbuttonTextOpen && SecondbuttonTextInstance.current) SecondbuttonTextInstance.current.color.set(secondbuttontext);
    if (primaryButtonTextOpen && primaryButtonTextInstance.current) primaryButtonTextInstance.current.color.set(primaryButtonText);


  }, [btnOpen, headOpen, paraOpen, secondbuttonOpen, secondbgOpen, SecondbuttonTextOpen, primaryButtonTextOpen]);

  useEffect(() => {
    // Handle click outside to close dropdowns
    function handleClickOutside(event: MouseEvent) {

      if (btnOpen && btnDropdownRef.current && !btnDropdownRef.current.contains(event.target as Node) && btnPickerRef.current && !btnPickerRef.current.contains(event.target as Node)) setBtnOpen(false);
      if (headOpen && headDropdownRef.current && !headDropdownRef.current.contains(event.target as Node) && headPickerRef.current && !headPickerRef.current.contains(event.target as Node)) setHeadOpen(false);
      if (paraOpen && paraDropdownRef.current && !paraDropdownRef.current.contains(event.target as Node) && paraPickerRef.current && !paraPickerRef.current.contains(event.target as Node)) setParaOpen(false);
      if (secondbuttonOpen && secondbtnDropdownRef.current && !secondbtnDropdownRef.current.contains(event.target as Node) && secondbtnPickerRef.current && !secondbtnPickerRef.current.contains(event.target as Node)) setSecondButtonOpen(false);
      if (secondbgOpen && secondbgDropdownRef.current && !secondbgDropdownRef.current.contains(event.target as Node) && secondbgPickerRef.current && !secondbgPickerRef.current.contains(event.target as Node)) setSecondbgopen(false);
      if (SecondbuttonTextOpen && secondbuttonDropdownRef.current && !secondbuttonDropdownRef.current.contains(event.target as Node) && SecondbuttonTextPickerRef.current && !SecondbuttonTextPickerRef.current.contains(event.target as Node)) setSecondbuttonTextOpen(false);
      if (primaryButtonTextOpen && primaryButtonTextDropdownRef.current && !primaryButtonTextDropdownRef.current.contains(event.target as Node) && primaryButtonTextPickerRef.current && !primaryButtonTextPickerRef.current.contains(event.target as Node)) setPrimaryButtonTextOpen(false);
    }

    if (btnOpen || headOpen || paraOpen || secondbuttonOpen || secondbgOpen || SecondbuttonTextOpen || primaryButtonTextOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [btnOpen, headOpen, paraOpen, secondbuttonOpen, secondbgOpen, SecondbuttonTextOpen, primaryButtonTextOpen]);

  return (
    <>
      {/* Main Container */}
      <div className="general">
        <div className="width-cust">
          <div className="cust">
            <div className="flex">
              <span className="font-blue1">Cookie Banner Alignment</span>

              <div className="tooltip-container">
                <img src={questionmark} alt="info" className="tooltip-icon" />
                <span className="tooltip-text2">Adjust the cookie banner's alignment for optimal placement on your site.</span>
              </div>
            </div>

            <div className="category-2 flex gap-4">
              <img
                src={getAlignmentIcon("left", selected === "left")}
                alt="leftalignment"
                onClick={() => setSelected("left")}
                className="cursor-pointer"
              />
              <img
                src={getAlignmentIcon("center", selected === "center")}
                alt="centertalignment"
                onClick={() => setSelected("center")}
                className="cursor-pointer"
              />
              <img
                src={getAlignmentIcon("right", selected === "right")}
                alt="righttalignment"
                onClick={() => setSelected("right")}
                className="cursor-pointer"
              />
            </div>
          </div>
          <div className="cust">
            <div className="flex">
              <span className="font-blue">Cookie Banner Styles</span>

              <div className="tooltip-containers">
                <img src={questionmark} alt="info" className="tooltip-icon" />
                <span className="tooltip-text">Customize the appearance of the cookie banner to match your site's design.</span>
              </div>
            </div>
            <div className="category-2">
              <img className="img-width cursor-pointer" src={getBannerStyleIcon("align")} alt="Align icon" style={{ opacity: style === "align" ? 1 : 0.4, border: style === "align" ? "2px solid #8C79FF" : "2px solid #ffffff00", borderRadius: "6px" }} onClick={() => setStyle(style === "align" ? "" : "align")} />
              <img className="img-width cursor-pointer" src={getBannerStyleIcon("alignstyle")} alt="Align icon" style={{ opacity: style === "alignstyle" ? 1 : 0.4, border: style === "alignstyle" ? "2px solid #8C79FF" : "2px solid #ffffff00", borderRadius: "6px" }} onClick={() => setStyle(style === "alignstyle" ? "" : "alignstyle")} />
              <img src={getBannerStyleIcon("bigstyle")} alt="Align icon" style={{ opacity: style === "bigstyle" ? 1 : 0.4, border: style === "bigstyle" ? "2px solid #8C79FF" : "2px solid #ffffff00", borderRadius: "6px" }} onClick={() => setStyle(style === "bigstyle" ? "" : "bigstyle")} />
            </div>
            <div className="category-2">
              <img
                className="img-width cursor-pointer"
                src={getBannerStyleIcon("centeralign")}
                alt="Align icon"
                style={{ opacity: style === "centeralign" ? 1 : 0.4, border: style === "centeralign" ? "2px solid #8C79FF" : "2px solid #ffffff00", borderRadius: "4px" }}
                onClick={() => setStyle(style === "centeralign" ? "" : "centeralign")}
              />
              <img
                className="img-width cursor-pointer"
                src={getBannerStyleIcon("fullwidth")}
                alt="Full Width icon"
                style={{ opacity: style === "fullwidth" ? 1 : 0.4, border: style === "fullwidth" ? "2px solid #8C79FF" : "2px solid #ffffff00", borderRadius: "4px" }}
                onClick={() => setStyle(style === "fullwidth" ? "" : "fullwidth")}
              />
            </div>
          </div>

          <div className="custs">

            <div className="flexs">
              <span className="font-blues">Typography</span>
              <div className="tooltip-containers">
                <img src={questionmark} alt="info" className="tooltip-icon" />
                <span className="tooltip-text">Customize font styles and sizes to enhance readability and design.</span>
              </div>
            </div>

            {renderDropdown("font", "Font", Font, fontOptions, SetFont, false)}

            <div className="flex">
              {renderDropdown("weight", "Font Weight", weight, weightOptions, SetWeight, false)}
              <div className="width">
                {renderDropdown("size", "Font Size", size, sizeOptions, SetSize, false)}
              </div>
            </div>

            <div>
              <div className="flex">

                <span>Alignment</span>
                <div className="category-3 flex gap-4">
                  <img
                    src={selectedtext === "left" ? checkedleft : justiflyleft}
                    alt="Left Align"
                    onClick={() => settextSelected("left")}
                    className="cursor-pointer"
                  />
                  <img
                    src={selectedtext === "center" ? checkedcenteralign : justiflycenter}
                    alt="Center Align"
                    onClick={() => settextSelected("center")}
                    className="cursor-pointer"
                  />
                  <img
                    src={selectedtext === "right" ? checkedright : justiflyright}
                    alt="Right Align"
                    onClick={() => settextSelected("right")}
                    className="cursor-pointer"
                  />
                </div>

              </div>

            </div>

            {/* Color Picker Section */}
          </div>
          <div><img src={line} alt="line" /></div>

          <div className="cust">
            <div className="flex">
              <span className="font-blue">Colors</span>
              <div className="tooltip-containers">
                <img src={questionmark} alt="info" className="tooltip-icon" />
                <span className="tooltip-text">Customize the colors to match your site's branding and design.</span>
              </div>
            </div>
            <div className="custom">
              <div className="customs">
                <div>
                  <span>Banner Background</span>
                  <div className="color-picker-dropdown" ref={dropdownRef}>
                    <button className="color-picker-button" onClick={() => {
                      setIsOpen(!isOpen);
                    }}>
                      <span className="color-text">{color}</span>
                      <div className="color-preview" style={{ backgroundColor: color }}></div>
                    </button>

                    <div
                      ref={colorPickerRef}
                      className={`color-picker-container ${isOpen ? "visible" : "hidden"}`}
                    >
                      <input
                        type="text"
                        className="hex-input"
                        value={color}
                        onChange={(e) => {
                          const hexValue = e.target.value;
                          if (/^#[0-9A-Fa-f]{0,6}$/.test(hexValue)) {
                            setColor(hexValue);
                            if (pickerInstance.current && hexValue.length === 7) {
                              pickerInstance.current.color.set(hexValue);
                            }
                          }
                        }}
                        placeholder="#ffffff"
                        maxLength={7}
                      />
                    </div>
                  </div>
                </div>


                <div>
                  <span>Second Background</span>
                  <div className="color-picker-dropdown" ref={secondbgDropdownRef}>
                    <button className="color-picker-button" onClick={() => setSecondbgopen(!secondbgOpen)}>
                      <span className="color-text">{bgColors}</span>
                      <div className="color-preview" style={{ backgroundColor: bgColors }}></div>
                    </button>
                    <div ref={secondbgPickerRef} className={`color-picker-container ${secondbgOpen ? "visible" : "hidden"}`}>
                      <input
                        type="text"
                        className="hex-input"
                        value={bgColors}
                        onChange={(e) => {
                          const hexValue = e.target.value;
                          if (/^#[0-9A-Fa-f]{0,6}$/.test(hexValue)) {
                            setBgColors(hexValue);
                            if (secondbgPickerInstance.current && hexValue.length === 7) {
                              secondbgPickerInstance.current.color.set(hexValue);
                            }
                          }
                        }}
                        placeholder="#798EFF"
                        maxLength={7}
                      />
                    </div>
                  </div>
                </div>

              </div>

              <div className="customs">
                <div>
                  <span>Body Text Color</span>
                  <div className="color-picker-dropdown" ref={paraDropdownRef}>
                    <button className="color-picker-button" onClick={() => setParaOpen(!paraOpen)}>
                      <span className="color-text">{paraColor}</span>
                      <div className="color-preview" style={{ backgroundColor: paraColor }}></div>
                    </button>
                    <div ref={paraPickerRef} className={`color-picker-container ${paraOpen ? "visible" : "hidden"}`}></div>
                  </div>
                </div>
                <div>
                  <span>Title Text Color</span>
                  <div className="color-picker-dropdown" ref={headDropdownRef}>
                    <button className="color-picker-button" onClick={() => setHeadOpen(!headOpen)}>
                      <span className="color-text">{headColor}</span>
                      <div className="color-preview" style={{ backgroundColor: headColor }}></div>
                    </button>
                    <div ref={headPickerRef} className={`color-picker-container ${headOpen ? "visible" : "hidden"}`}></div>
                  </div>
                </div>
              </div>

              <div className="flex">
                <span className="font-blue">Primary Button</span>
                <div className="tooltip-containers">
                  <img src={questionmark} alt="info" className="tooltip-icon" />
                  <span className="tooltip-text">Style the primary (Accept) button to match your site’s branding.</span>
                </div>
              </div>
              <div className="customs">

                <div>
                  <span>Background Color</span>
                  <div className="color-picker-dropdown" ref={secondbtnDropdownRef}>
                    <button className="color-picker-button" onClick={() => setSecondButtonOpen(!secondbuttonOpen)}>
                      <span className="color-text">{secondcolor}</span>
                      <div className="color-preview" style={{ backgroundColor: secondcolor }}></div>
                    </button>
                    <div ref={secondbtnPickerRef} className={`color-picker-container ${secondbuttonOpen ? "visible" : "hidden"}`}></div>
                  </div>
                </div>

                <div>
                  <span>Text Color</span>
                  <div className="color-picker-dropdown" ref={primaryButtonTextDropdownRef}>
                    <button className="color-picker-button" onClick={() => setPrimaryButtonTextOpen(!primaryButtonTextOpen)}>
                      <span className="color-text">{primaryButtonText}</span>
                      <div className="color-preview" style={{ backgroundColor: primaryButtonText }}></div>
                    </button>
                    <div ref={primaryButtonTextPickerRef} className={`color-picker-container ${primaryButtonTextOpen ? "visible" : "hidden"}`}></div>
                  </div>
                </div>
              </div>

              <div className="flex">
                <span className="font-blue">Secondary Button</span>
                <div className="tooltip-containers">
                  <img src={questionmark} alt="info" className="tooltip-icon" />
                  <span className="tooltip-text">  Customize the Reject/Preferences (secondary) buttons to match your site’s branding.
                  </span>
                </div>
              </div>

              <div className="customs">
                <div>
                  <span>Background Color</span>
                  <div className="color-picker-dropdown" ref={btnDropdownRef}>
                    <button className="color-picker-button" onClick={() => setBtnOpen(!btnOpen)}>
                      <span className="color-text">{btnColor}</span>
                      <div className="color-preview" style={{ backgroundColor: btnColor }}></div>
                    </button>
                    <div ref={btnPickerRef} className={`color-picker-container ${btnOpen ? "visible" : "hidden"}`}></div>
                  </div>
                </div>

                <div>
                  <span>Text Color</span>
                  <div className="color-picker-dropdown" ref={secondbuttonDropdownRef}>
                    <button className="color-picker-button" onClick={() => setSecondbuttonTextOpen(!SecondbuttonTextOpen)}>
                      <span className="color-text">{secondbuttontext}</span>
                      <div className="color-preview" style={{ backgroundColor: secondbuttontext }}></div>
                    </button>
                    <div ref={SecondbuttonTextPickerRef} className={`color-picker-container ${SecondbuttonTextOpen ? "visible" : "hidden"}`}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="cust2">
            <div className="flexs">
              <span className="font-blue">Corner Radius</span>
              <div className="tooltip-containers">
                <img src={questionmark} alt="info" className="tooltip-icon" />
                <span className="tooltip-text">Adjust the corner radius of buttons and containers in the cookie banner.</span>
              </div>
            </div>
            <div className="flexy">
              <div className="flex-down">
                <div>
                  <span>Container</span>
                  <div className="settings-groups width">
                    <input
                      type="number"
                      className="focus:outline-none focus:ring-0 focus:border-none"
                      id="border-radius"
                      value={borderRadius}
                      min="0"
                      step="1"
                      onChange={handleBorderRadiusChange}
                    />
                  </div>
                </div>
              </div>
              <div className="flex-down">
                <div>
                  <span>Button</span>
                  <div className="settings-groups width">
                    <input
                      type="number"
                      id="border-radius-button"
                      value={buttonRadius}
                      min="0"
                      step="1"
                      onChange={handleButtonRadiusChange}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div>
            </div>
          </div>
        </div>

        <div className="settings-group-preview">
          <h3>Preview</h3>
          <div className="preview-area">
            <div className="topbar">
              <img src={dots} alt="dots" className="threedots" />
            </div>
            <div className="consentbit-logo">
              <img src={logo} alt="logo" />
            </div>
            {/* gdpr */}
            <div
              className={`cookie-banner ${animation} ${isActive ? "active" : ""}`}
              style={{
                transition: `transform 0.5s ${easing}, opacity 0.5s ${easing}`,
                position: "absolute",
                ...(style !== "fullwidth" && {
                  bottom: "16px",
                  left: selected === "left" ? "16px" : selected === "center" ? "17%" : "auto",
                  right: selected === "right" ? "16px" : "auto",
                }),
                // transform: selected === "center" ? "translateX(-50%)" : "none",
                fontFamily: Font,
                textAlign: selectedtext,
                alignItems: style === "centeralign" ? "center" : undefined,
                fontWeight: weight,
                fontSize: `${size}px`,
                width: previewDimensions.width,
                height: previewDimensions.minHeight,
                borderRadius: `${borderRadius}px`,
                backgroundColor: color,
              }}
            >
              {style === "alignstyle" && <div className="secondclass" style={{ backgroundColor: bgColors, borderBottomRightRadius: `${borderRadius}px`, borderTopRightRadius: `${borderRadius}px` }}></div>}
              <div className="space" style={{ color: headColor, fontWeight: weight, display: "flex", justifyContent: "space-between" , fontFamily: Font, }}>
                <h4 style={{fontFamily: Font}}>
                  {language === "English"
                    ? "Cookie Settings"
                    : language === "Spanish"
                      ? "Configuración de Cookies"
                      : language === "French"
                        ? "Paramètres des Cookies"
                        : language === "German"
                          ? "Cookie-Einstellungen"
                          : language === "Swedish"
                            ? "Cookie-inställningar"
                            : language === "Dutch"
                              ? "Cookie-instellingen"
                              : language === "Portuguese"
                                ? "Configurações de Cookies"
                                : language === "Italian"
                                  ? "Impostazioni dei Cookie"
                                  : language === "Polish"
                  ? "Ustawienia plików cookie"
                                  : "Cookie Settings"}
                </h4>

                {closebutton ? <p className="closebutton">X</p> : ""}
              </div>

              <div className="padding" style={{ color: paraColor, alignItems: style === "centeralign" ? "center" : undefined, }}>
                <span style={{ alignItems: style === "centeralign" ? "center" : undefined, }}>
                  {language === "English"
                    ? "We use cookies to provide you with the best possible experience. They also allow us to analyze user behavior in order to constantly improve the website for you."
                    : language === "Spanish"
                      ? "Utilizamos cookies para brindarle la mejor experiencia posible. También nos permiten analizar el comportamiento del usuario para mejorar constantemente el sitio web para usted."
                      : language === "French"
                        ? "Nous utilisons des cookies pour vous offrir la meilleure expérience possible. Ils nous permettent également d'analyser le comportement des utilisateurs afin d'améliorer constamment le site Web pour vous."
                        : language === "German"
                          ? "Wir verwenden Cookies, um Ihnen das bestmögliche Erlebnis zu bieten. Sie helfen uns auch, das Nutzerverhalten zu analysieren, um die Website kontinuierlich für Sie zu verbessern."
                          : language === "Swedish"
                            ? "Vi använder cookies för att ge dig den bästa möjliga upplevelsen. De låter oss också analysera användarbeteende för att ständigt förbättra webbplatsen för dig."
                            : language === "Dutch"
                              ? "We gebruiken cookies om u de best mogelijke ervaring te bieden. Ze stellen ons ook in staat om gebruikersgedrag te analyseren om de website voortdurend voor u te verbeteren."
                              : language === "Portuguese"
                                ? "Utilizamos cookies para oferecer a melhor experiência possível. Eles também nos permitem analisar o comportamento dos usuários para melhorar continuamente o site para você."
                                : language === "Italian"
                                  ? "Utilizziamo i cookie per offrirti la migliore esperienza possibile. Ci permettono anche di analizzare il comportamento degli utenti per migliorare costantemente il sito web per te."
                                  : language === "Polish" 
                                  ? "Używamy plików cookie, aby zapewnić Ci najlepsze możliwe doświadczenie. Pozwalają nam również analizować zachowanie użytkowników, aby stale ulepszać stronę internetową dla Ciebie."
                                  : "We use cookies to provide you with the best possible experience. They also allow us to analyze user behavior in order to constantly improve the website for you."}
                </span>
                {privacyUrl && (
                        <span>
                          {" "}
                          <a 
                            href={privacyUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ 
                              color: paraColor, 
                              textDecoration: "none",
                              fontSize: `${typeof size === 'number' ? size - 2 : 12}px`
                            }}
                            onMouseEnter={(e) => (e.target as HTMLAnchorElement).style.textDecoration = "underline"}
                            onMouseLeave={(e) => (e.target as HTMLAnchorElement).style.textDecoration = "none"}
                          >
                           {language==="English"?"More Info": 
                          language === "Polish" ? "Więcej informacji" :
                           language=== "Spanish"?"Más Información": 
                           language=== "French"?"Plus d'infos": 
                           language=== "German"?"Mehr Info": 
                           language=== "Swedish"?"Mer info": 
                           language=== "Dutch"?"Meer info": 
                           language=== "Portuguese"?"Mais info": 
                           language=== "Italian"?"Più info": "More Info"}
                          </a>
                        </span>
                      )}

              </div>
              <div className="button-wrapp" style={{ justifyContent: style === "centeralign" ? "center" : undefined,fontFamily: Font }}>
                <button
                  className="btn-preferences"
                  style={{
                    borderRadius: `${buttonRadius}px`,
                    backgroundColor: btnColor,
                    color: secondbuttontext,
                    fontFamily: Font 
                  }}
                >
                  {language === "English"
                    ? "Preference"
                    : language === "Spanish"
                      ? "Preferencias"
                      : language === "French"
                        ? "Préférences"
                        : language === "German"
                          ? "Einstellungen"
                          : language === "Swedish"
                            ? "Inställningar"
                            : language === "Dutch"
                              ? "Voorkeuren"
                              : language === "Portuguese"
                                ? "Preferências"
                                : language === "Italian"
                                  ? "Preferenze"
                                  :  language === "Polish"
                  ? "Preferencje"
                  : "Preference"}
                </button>

                <button
                  className="btn-reject"
                  style={{
                    borderRadius: `${buttonRadius}px`,
                    backgroundColor: btnColor,
                    color: secondbuttontext,
                    fontFamily: Font 
                  }}
                >
                  {language === "English"
                    ? "Reject"
                    : language === "Spanish"
                      ? "Rechazar"
                      : language === "French"
                        ? "Refuser"
                        : language === "German"
                          ? "Ablehnen"
                          : language === "Swedish"
                            ? "Avvisa"
                            : language === "Dutch"
                              ? "Weigeren"
                              : language === "Portuguese"
                                ? "Rejeitar"
                                : language === "Italian"
                                  ? "Rifiuta":
                                  language === "Polish"
                  ? "Odrzuć"
                                  : "Reject"}
                </button>

                <button
                  className="btn-accept"
                  style={{
                    borderRadius: `${buttonRadius}px`,
                    backgroundColor: secondcolor,
                    color: primaryButtonText,
                    fontFamily: Font 
                  }}
                >
                  {language === "English"
                    ? "Accept"
                    : language === "Spanish"
                      ? "Aceptar"
                      : language === "French"
                        ? "Accepter"
                        : language === "German"
                          ? "Akzeptieren"
                          : language === "Swedish"
                            ? "Acceptera"
                            : language === "Dutch"
                              ? "Accepteren"
                              : language === "Portuguese"
                                ? "Aceitar"
                                : language === "Italian"
                                  ? "Accetta":
                                  language === "Polish"
                  ? "Zaakceptuj"
                                  : "Accept"}
                </button>
              </div>
            </div>
          </div>
          <div>
            <div className="preference-banner">
              <div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Customization;
