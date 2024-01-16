import { profileForm } from "@/constants/profile"
// import { categorizedSkills, icons } from '@/constants/skills'
import { socialForm } from '@/constants/social'
import { addonsForm } from "@/constants/addons"
import { supportForm } from "@/constants/support"
import { Title, Skills, SubTitle, Social, Addons, PostsFormItem, Posts, Supports } from "@/templates/default"

let index = 0
let templateStr = ''
const generator: any = {
    tmp: 'default', // 模版类型
    form: {
        profile: {},
        social: {},
        addons: {},
        skills: [],
        posts: [],
        supports: {}
    },
    _preview: false, // 是否显示预览区域
    get preview(): boolean {
        return this._preview
    },
    set preview(show: boolean) {
        const previewEle: any = document.querySelector('#preview')
        const previewMaskEle: any = document.querySelector('#preview-mask')
        const previewWrapperEle: any = document.querySelector('#preview-wrapper')


        if (show) {
            this._preview = true
            previewEle.hidden = false
            previewMaskEle.onclick = () => {
                console.info('previewMaskEle.onclick')
                generator.preview = false
            }
            previewWrapperEle.onclick = (e: any) => {
                e.stopPropagation()
            }
            setTimeout(() => {
                previewMaskEle.classList.remove('opacity-0')
                previewMaskEle.classList.remove('pointer-events-none')
            }, 30)
        } else {
            this._preview = false
            previewEle.hidden = true
            previewMaskEle.classList.add('opacity-0')
            previewMaskEle.classList.add('pointer-events-none')
        }
        
    }
        
}
// initial profile data values
profileForm.forEach((item: any) => {
    generator.form.profile[item.name] = item.value || ''
})
// initial socials data values
socialForm.forEach((item: any) => {
    generator.form.social[item.name] = item.value || ''
})
// initial addons data values
addonsForm.forEach((item: any) => {
    generator.form.addons[item.name] = item.checked
})
// initial supports data values
Object.keys(supportForm).forEach((key: string) => {
    generator.form.supports[key] = ''
})

console.info('generator:', generator)


class GithubProfileGenerator extends HTMLElement {
    data: any = generator.form
    constructor() {
        super()
        
        const profileInputs = this.querySelectorAll('.generator-profile-input') 
        const socialInputs = this.querySelectorAll('.generator-social-input') 
        const skillsCheckboxs = this.querySelectorAll('.generator-skills-checkbox')
        const addonsCheckboxs = this.querySelectorAll('.generator-addons-checkbox')
        const supportInputs = this.querySelectorAll('.generator-support-input')
        
        const addItem: any = this.querySelector('#addItem')
        const generateBtn: any = this.querySelector('#generate')

        profileInputs.forEach((input: any) => this.handleInput(input, 'profile'))
        socialInputs.forEach((input: any) => this.handleInput(input, 'social'))
        skillsCheckboxs.forEach((checkbox: any) => this.handleCheckedChange(checkbox, 'skills'))
        addonsCheckboxs.forEach((checkbox: any) => this.handleCheckedChange(checkbox, 'addons'))
        supportInputs.forEach((input: any) => this.handleInput(input, 'supports'))
        addItem.addEventListener('click', () => this.handleAddPostItem())
        generateBtn.addEventListener('click', () => this.handleGenerator())

    }
    handleInput(inputEle: any, field: string) {
        inputEle.addEventListener('input', () => {
            this.data[field][inputEle.id] = inputEle.value
            // console.info('formData:', field, this.data[field], formData)
        })
    }
    handlePostsInput(inputEle: any, type: string) {
        inputEle.oninput =() => {
            // this.data.posts[inputEle.id] = inputEle.value
            const postItem = this.data.posts.find((item: any) => item.index === Number(inputEle.dataset.index))
            console.info(this.data.posts, inputEle, postItem)
            postItem[type] = inputEle.value
            console.info('formData posts:', this.data.posts)
        }
    }
    handleCheckedChange(checkboxEle: any, field: string) {
        checkboxEle.addEventListener('change', () => {
            if (field === 'addons') {
                this.data[field][checkboxEle.id] = checkboxEle.checked
            } else if (field === 'skills') {
                if (checkboxEle.checked) {
                    this.data[field].push(checkboxEle.id)
                } else {
                    const index = this.data[field].indexOf(checkboxEle.id)
                    this.data[field].splice(index, 1)
                }
            }
            // console.info('formData:', field, this.data[field], formData)
        })
    }
    bindPostsEvent() {
        const removeItems: any = this.querySelectorAll('.removeItem')

        removeItems.forEach((removeItem: any) => {
            console.info('removeItem', removeItem)
            this.handleRemovePostItem(removeItem)
        })

    }
    handleAddPostItem() {
        const newItem = {
            index: index++,
            link: '',
            text: ''
        }
        this.data.posts.push(newItem)
        console.info('handleGenerator:', this.data)
        const posts: any = this.querySelector('#posts')
        posts.appendChild(PostsFormItem(newItem))

        const textItems: any = this.querySelectorAll('.generator-posts-text')
        const linkItems: any = this.querySelectorAll('.generator-posts-link')
        textItems.forEach((input: any) => this.handlePostsInput(input, 'text'))
        linkItems.forEach((input: any) => this.handlePostsInput(input, 'link'))
        this.bindPostsEvent()
    }
    handleRemovePostItem(removeItemEle: any) {
        removeItemEle.onclick = () => {
            console.info('handleRemovePostItem:', typeof removeItemEle.dataset.index, removeItemEle.dataset.index)
            const posts: any = this.querySelector('#posts')
            this.data.posts.splice(Number(removeItemEle.dataset.index), 1)
            const index = this.data.posts.findIndex((item: any) => item.index = removeItemEle.dataset.index)
            posts.childNodes[index].remove()
            // posts.innerHTML = PostsFormHtml(this.data.posts)

            // this.bindPostsEvent()
        }
    }
    handleGenerator() {
        console.info('handleGenerator:', this.data)
        generator.preview = !generator.preview
    }
}

class GithubProfilePreview extends HTMLElement {
    static observedAttributes = ["hidden"];
    data: any = generator.form
    constructor() {
        super()

        const copyCode: any = this.querySelector('#copyCode')
        const downloadFile: any = this.querySelector('#downloadFile')
        copyCode.onclick = this.handleCopyCode
        downloadFile.onclick = this.handleDownload
    }
    attributeChangedCallback(name: string, oldValue: any, newValue: any) {
        const profilePreview: any = this.querySelector('#preview-content')
        console.log(this.hidden)
        if (name === 'hidden' && !this.hidden) {
            templateStr = ''
            profilePreview.innerHTML = this.renderProfile()
        }
        if (name === 'hidden' && this.hidden) {
            const copyCode: any = this.querySelector('#copyCode')
            const copyCodeIcon: any = this.querySelector('.copyCodeIcon')
            const copyCodeSuccIcon: any = this.querySelector('.copyCodeSuccIcon')
            copyCodeIcon.classList.remove('hidden')
            copyCodeSuccIcon.classList.add('hidden')
            copyCode.classList.remove('text-green-500')
            copyCode.classList.remove('border-green-500')
        }
    }
    async handleCopyCode() {
        const copyCode: any = this
        const copyCodeIcon: any = this.querySelector('.copyCodeIcon')
        const copyCodeSuccIcon: any = this.querySelector('.copyCodeSuccIcon')
        await navigator.clipboard.writeText(templateStr)
        copyCodeIcon.classList.add('hidden')
        copyCodeSuccIcon.classList.remove('hidden')
        copyCode.classList.add('text-green-500')
        copyCode.classList.add('border-green-500')
        console.info('复制成功')
    }
    handleDownload() {
        let a = document.createElement('a')
        a.href = 'data:text/plain;charset=utf-8,' + templateStr
        a.download = 'Readme.md'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }
    renderProfile() {
        const { profile, social, addons, skills, posts, supports } = this.data

        if (generator.tmp === 'default') {
            templateStr += Title(profile.title)
            templateStr += SubTitle(profile.subTitle)
            templateStr += Skills(skills)
            templateStr += Posts(posts)
            templateStr += Social(social)
            templateStr += Addons(addons, profile.username)
            templateStr += Supports(supports)
        } else {
            console.warn('暂未支持的模板类型')
            // profilePreview.innerHTML = this.renderProfile()
        }

        return templateStr
    }
}

customElements.define('github-profile-generator', GithubProfileGenerator)
customElements.define('github-profile-preview', GithubProfilePreview)