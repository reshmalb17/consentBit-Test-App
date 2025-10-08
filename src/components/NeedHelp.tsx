
import React, { useEffect, useRef, useState } from 'react';
const questionmark = new URL("../assets/question.svg", import.meta.url).href;
const book = new URL("../assets/book icon.svg", import.meta.url).href;
const users = new URL("../assets/user icon.svg", import.meta.url).href;
const watch = new URL("../assets/video.svg", import.meta.url).href;
const doc = new URL("../assets/feedback.svg", import.meta.url).href;

type HelpItem = {
  label: string;
  href: string;
  icon: string;
};

const NeedHelp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLDivElement | null>(null);

  const helpItems: HelpItem[] = [
    { label: 'Watch tutorial', href: 'https://www.youtube.com/watch?v=bS0Xdcurdrc', icon: watch },
    { label: 'Check docs', href: 'https://www.consentbit.com/help-document', icon: book },
    { label: 'Get support', href: 'https://www.consentbit.com/contact', icon: users },
    { label: 'Send feedback', href: 'https://www.consentbit.com/contact', icon: doc },
  ];

  const toggleOpen = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="help-dropdown-container">
      <div className="need-help" onClick={toggleOpen} ref={buttonRef}>
        <img src={questionmark} alt="Need help?" />
        <h5>Need help?</h5>
      </div>

      {isOpen && (
        <div className="help-dropdown" ref={dropdownRef}>
          <p className="helptext">Help</p>
          <ul>
            {helpItems.map((item, index) => (
              <li key={index}>
                <a href={item.href} target="_blank" rel="noopener noreferrer">
                  <img
                    src={item.icon}
                    alt={item.label}
                    style={{ marginRight: '8px', verticalAlign: 'middle',opacity: "50%" }}
                    width="16"
                    height="16"
                  />
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NeedHelp;
