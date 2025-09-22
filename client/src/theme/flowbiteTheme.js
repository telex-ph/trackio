import { createTheme } from "flowbite-react";

const flowbiteTheme = createTheme({
  button: {
    base: "cursor-pointer"
  },
  textInput: {
    base: `
  [&>div>input]:!bg-white
  [&>div>input]:!text-[rgb(95,95,95)]
  [&>div>input]:!border
  [&>div>input]:!border-[rgb(209,213,219)]
  [&>div>input]:!bg-[rgb(249,250,251)]
`
  },
  
});

export default flowbiteTheme;
