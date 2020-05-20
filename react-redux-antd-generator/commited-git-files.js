const spawn = require('cross-spawn')
const args = require('minimist')(process.argv.slice(2))
const Linter = require('eslint')

const { CLIEngine } = Linter
const cli = new CLIEngine({
    ignore: true,
})
const JS_REG = /\S\.js\b/

/** ======================================== HELPERS ======================================== * */
const run = (command, callback) => {
    const bits = command.split(' ')
    const commondArgs = bits.slice(1)

    const result = spawn.sync(bits[0], commondArgs)
    /* =======================================================================================================
        https://nodejs.org/api/child_process.html#child_process_child_process_spawnsync_command_args_options
        result<Object>:
            pid <number> Pid of the child process.
            output <Array> Array of results from stdio output.
            stdout <Buffer> | <string> The contents of output[1].
            stderr <Buffer> | <string> The contents of output[2].
            status <number> The exit code of the child process.
            signal <string> The signal used to kill the child process.
            error <Error> The error object if the child process failed or timed out.
    ** ======================================================================================================= */
    const { stdout = Buffer.from(''), stderr = Buffer.from('') } = result
    return {
        stdout,
        stdoutStr: stdout.toString(),
        stderr,
        stderrStr: stderr.toString(),
        result,
    }
}

const codeToStatus = code => {
    /* =======================================================================================================
        https://git-scm.com/docs/git-diff-index
        A: addition of a file
        C: copy of a file into a new one
        D: deletion of a file
        M: modification of the contents or mode of a file
        R: renaming of a file
        T: change in the type of the file
        U: file is unmerged (you must complete the merge before it can be committed)
        X: "unknown" change type (most probably a bug, please report it)
    ** ======================================================================================================= */

    const map = {
        A: 'Added',
        C: 'Copied',
        D: 'Deleted',
        M: 'Modified',
        R: 'Renamed',
        T: 'Type-Change',
        U: 'Unmerged',
        X: 'Unknown',
        B: 'Broken',
    }
    return map[code.charAt(0)]
}

let gitDiffTree

if (args._.length > 0) {
    gitDiffTree = `git show ${args._[0]} --name-status --oneline --diff-filter=ACDMRTUXB`
} else {
    console.error('No CommitId! Lint diff')
    gitDiffTree = 'git diff HEAD --name-status --oneline --diff-filter=ACDMRTUXB'
}

console.log(`Run command: ${gitDiffTree}`)
const { stdoutStr, stderrStr } = run(gitDiffTree)
if (stderrStr !== '') {
    console.error(stderrStr)
} else {
    const results = []
    const lines = stdoutStr.split('\n')
    let iLines = lines.length
    while (iLines) {
        iLines -= 1
        const line = lines[iLines]
        if (line !== '') {
            const parts = line.split('\t')
            const result = {
                filename: parts[2] || parts[1],
                status: codeToStatus(parts[0]),
            }
            if (typeof result.filename !== 'undefined') {
                results.push(result)
            }
        }
    }
    // 判断哪个文件需要被lint
    // 条件1：js文件
    // 条件2：是否被eslint ignored
    const filter = result => JS_REG.test(result.filename) && !cli.isPathIgnored(result.filename)
    const needLintedResults = results.filter(filter)
    console.log('The files need to be linted is listed below:')
    console.log(needLintedResults)
    const report = cli.executeOnFiles(needLintedResults.map(result => result.filename))
    const { errorCount, warningCount, results: lintResults } = report
    const warnings = lintResults.filter(lintResult => lintResult.warningCount > 0)
    const errors = lintResults.filter(lintResult => lintResult.errorCount > 0)
    if (errorCount > 0) {
        console.error(`Linter found ${errorCount} errors`)
        console.error('The files case errors is listed below: ')
        console.error(errors.map(error => error.filePath).join('\n'))
        process.exit(1)
    }
    if (warningCount > 0) {
        console.log(`Linter found ${errorCount} errors, But found ${warningCount} warnings`)
        console.log('The files case warnings is listed below: ')
        console.log(warnings.map(warning => warning.filePath).join('\n'))
    }
    if (errorCount <= 0 && warningCount <= 0) {
        console.log('Perfect, Linter didn\'t find any errors and warnings!!!')
    }
}
