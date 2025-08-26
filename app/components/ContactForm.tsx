const ContactForm = () => {
  return (
    <main className="main-container py-16 flex-grow-1 flex flex-col items-center gap-4">
      <h2 className="text-3xl font-bold text-center">Get in touch</h2>
      <p className="text-lg text-center">
        Have a question or want to get involved? I&apos;d love to hear from you.
      </p>
      <form className="flex flex-col gap-4 w-md max-w-full">
        <input type="text" placeholder="Name" className="input" />
        <input type="email" placeholder="Email" className="input" />
        <textarea
          placeholder="Message"
          className="input resize-none"
          rows={6}
        ></textarea>
        <button type="submit" className="btn dark-btn">
          Send
        </button>
      </form>
    </main>
  );
};

export default ContactForm;
