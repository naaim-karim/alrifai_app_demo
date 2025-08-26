import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-primary text-white py-4 lg:py-2">
      <div className="main-container flex flex-col justify-center items-center gap-2 lg:flex-row lg:justify-between">
        <Image
          className="hidden md:block w-16"
          src="/alrifai_logo.png"
          alt="Alrifai Logo"
          width={500}
          height={481}
        />
        <Link href="/" className="text-white font-bold text-2xl md:hidden">
          Alrifai
        </Link>
        {/* <div className="flex gap-4">
          <a
            href="https://www.youtube.com/@abd.k.alrifaee/videos"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Youtube />
          </a>
          <a
            href="https://www.facebook.com/Abdullkarem.Alrefai.Lawsuit/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Facebook />
          </a>
          <a
            href="mailto:alrifaiorg@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Mail />
          </a>
        </div> */}
        <p className="text-xs">
          Copyright {new Date().getFullYear()} Alrifai Education. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
