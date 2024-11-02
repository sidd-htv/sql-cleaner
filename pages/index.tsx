import { translate } from '@vitalets/google-translate-api'

import { format } from 'sql-formatter';

export default function Home() {
  // Detect Japanese characters regex
  const regex = /[\u3000-\u303F]|[\u3040-\u309F]|[\u30A0-\u30FF]|[\uFF00-\uFFEF]|[\u4E00-\u9FAF]|[\u2605-\u2606]|[\u2190-\u2195]|\u203B/g;

  async function handleOnClickClean() {
    const inEl = document.getElementById("input") as HTMLTextAreaElement
    const outEl = document.getElementById("output") as HTMLTextAreaElement

    // Remove and correct sql command characters
    let sql = inEl.value
      .replaceAll("\"", "")
      .replaceAll("+", "")
      .replaceAll("''", "'")

    // Format sql
    sql = format(sql, {
      language: 'mysql',
      keywordCase: 'upper'
    })

    // Split sql command to get Japanese words
    const arr = sql
      .split('\n')
      .map(v => v.split(' ')
        .filter(v2 => v2 !== "")
        .filter(v3 => v3 !== "'　'")
        .filter(v4 => regex.test(v4)))
      .flat()

    // Translate words contain Japanese characters
    if (arr.length > 0) {
      sql = await addTranslateSuffix(sql, arr)
      outEl.value = sql
    }

    outEl.value = sql
  }

  async function addTranslateSuffix(sql: string, arr: string[]): Promise<string> {
    const arrStr = arr.join()

    try {
      const {text} = await translate(arrStr, {to: 'en'})
      console.log(text)
    } catch (e) {
      console.log(e)
    }

    return sql
  }

  return (
    <div
      className="p-8"
    >
      {/*Header*/}
      <header>
        <h1 className="font-bold text-4xl">SQL Cleaner</h1>
        <span>A support tool for clean sql commands</span>
      </header>

      {/*Main content*/}
      <main className="mt-12">
        {/*Action Button*/}
        <div className="flex justify-end">
          <button type="button"
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                  onClick={handleOnClickClean}
          >Clean
          </button>

        </div>

        {/*Main Content*/}
        <div className="flex flex-row mt-6">
          {/*Input*/}
          <div className="flex-1">
            <label htmlFor="input"
                   className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Input</label>
            <textarea id="input"
                      className="block p-2.5 w-full h-1/2 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Enter the dirty SQL command here"
            ></textarea>

          </div>

          {/*Separator*/}
          <div className="w-5"></div>

          {/*Output*/}
          <div className="flex-1 h-screen">
            <label htmlFor="output"
                   className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Output</label>
            <textarea id="output"
                      className="block p-2.5 w-full h-1/2 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Beauty SQL command will be show here"
                      readOnly
            ></textarea>
          </div>
        </div>
      </main>
    </div>
  );
}
