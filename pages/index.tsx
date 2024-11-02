import { translate } from '@vitalets/google-translate-api'

import { format } from 'sql-formatter';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  // Detect Japanese characters regex
  const regex = /[\u3000-\u303F]|[\u3040-\u309F]|[\u30A0-\u30FF]|[\uFF00-\uFFEF]|[\u4E00-\u9FAF]|[\u2605-\u2606]|[\u2190-\u2195]|\u203B/g;

  async function handleOnClickCopy() {
    const outEl = document.getElementById("output") as HTMLTextAreaElement
    const value = outEl.value
    await navigator.clipboard.writeText(value)
    toast.success("Copied beauty command")
  }

  async function handleOnClickClean() {
    const inEl = document.getElementById("input") as HTMLTextAreaElement
    const outEl = document.getElementById("output") as HTMLTextAreaElement

    // Remove and correct sql command characters
    let sql = inEl.value
      .replaceAll("\"", "")
      .replaceAll("+", "")
      .replaceAll("''", "'")

    // Format sql
    try {
      sql = format(sql)
    } catch (e) {
      toast.error(`${e.message}`)
    }

    // Split sql command to get Japanese words
    const arr = sql
      .split('\n')
      .map(v => v.split(' ')
        .filter(v2 => v2 !== "")
        .filter(v3 => v3 !== "'　'")
        .filter(v4 => regex.test(v4)))
      .flat()
    const uniqArr = [...new Set(arr)]

    // Translate words contain Japanese characters
    if (uniqArr.length > 0) {
      try {
        sql = await addTranslateSuffix(sql, uniqArr)
        outEl.value = sql
      } catch (e) {
        toast.error(`${e.message}`)
      }
    }

    outEl.value = sql
  }

  async function addTranslateSuffix(sql: string, arr: string[]): Promise<string> {
    let resultSql = sql
    const arrStr = arr.join()

    const {text} = await translate(arrStr, {to: 'en'})

    const transArr = text.split(",")

    arr.forEach((v, i) => {
      const tranWord = transArr[i]
      const resultWord = `${v} /*${tranWord}*/`
      resultSql = resultSql.replaceAll(v, resultWord)
    })

    return resultSql
  }

  return (
    <div
      className="p-8 flex flex-col"
    >
      <ToastContainer/>

      {/*Header*/}
      <header>
        <h1 className="font-bold text-4xl">SQL Cleaner</h1>
        <span>A support tool for clean sql commands and add suffix localization</span>
      </header>

      {/*Main content*/}
      <main className="mt-12">
        {/*Action Button*/}
        <div className="flex justify-end">
          <button type="button"
                  className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                  onClick={handleOnClickCopy}
          >Copy
          </button>

          <button type="button"
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                  onClick={handleOnClickClean}
          >Clean
          </button>

        </div>

        {/*Main Content*/}
        <div className="flex flex-row mt-6 h-96">
          {/*Input*/}
          <div className="flex-1">
            <label htmlFor="input"
                   className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Input</label>
            <textarea id="input"
                      className="block p-2.5 w-full h-full text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 text-sm"
                      placeholder="Enter the dirty SQL command here"
            ></textarea>

          </div>

          {/*Separator*/}
          <div className="w-5"></div>

          {/*Output*/}
          <div className="flex-1">
            <label htmlFor="output"
                   className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Output</label>
            <textarea id="output"
                      className="block p-2.5 w-full h-full text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 text-sm"
                      placeholder="Beauty SQL command will be show here"
                      readOnly
            ></textarea>
          </div>
        </div>
      </main>

      {/*Footer*/}
      <footer className="mt-12 flex flex-col text-xs italic">
        <span>This project use google-translate-api, and translate.google.com do not provide CORS headers allowing access from other domains.</span>
        <span>Therefore, please open Browser with disable-web-security flag.</span>
        <a href="https://github.com/sidd-htv/sql-cleaner?tab=readme-ov-file#cors-issues">Click here for detail.</a>
      </footer>
    </div>
  );
}
