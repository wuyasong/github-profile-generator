
window.onload = function() {
    let isEdit = false
    const mdContent = document.querySelector('#preview-content')
    const copyCode: any = document.querySelector('#copyCode')
    const downloadFile: any = document.querySelector('#downloadFile')
    const editor: any = document.querySelector('#editor')
    const editCode: any = document.querySelector('#editCode')
    const editCodeText: any = document.querySelector('#editCodeText')
    copyCode.onclick = handleCopyCode
    downloadFile.onclick = handleDownload
    editCode.onclick = handleEdit

    async function handleCopyCode() {
        const content: any = mdContent?.innerHTML
        const copyCodeIcon: any = document.querySelector('.copyCodeIcon')
        const copyCodeSuccIcon: any = document.querySelector('.copyCodeSuccIcon')
        await navigator.clipboard.writeText(content)
        copyCodeIcon.classList.add('hidden')
        copyCodeSuccIcon.classList.remove('hidden')
        copyCode.classList.add('text-green-500')
        copyCode.classList.add('border-green-500')
        console.info('复制成功')
    }
    function handleDownload() {
        const content: any = mdContent?.innerHTML
        let a = document.createElement('a')
        a.href = 'data:text/plain;charset=utf-8,' + content
        a.download = 'Readme.md'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

    function handleEdit() {
        isEdit = !isEdit
        const content: any = mdContent?.innerHTML
        const editIcon: any = document.querySelector('.editIcon')
        const previewIcon: any = document.querySelector('.previewIcon')
        editIcon.classList.toggle('hidden')
        previewIcon.classList.toggle('hidden')
        editCodeText.innerText = !isEdit ? 'Edit Code' : 'Preview'

        mdContent?.classList.toggle('hidden')
        editor?.classList.toggle('hidden')
        if (isEdit) {
            editor.value = content
        } else {
            mdContent!.innerHTML = editor.value
        }
    }
}
