const BASE_URL = "https://lighthouse-user-api.herokuapp.com/";
const INDEX_URL = BASE_URL + "api/v1/users/";

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form")
const searchInput = document.querySelector("#search-input")
const paginator = document.querySelector("#paginator")

const users = JSON.parse(localStorage.getItem("Friends")) || []
const USERS_PER_PAGE = 24
let filteredUsers = []



// 處理 UI顯示的 user list
function renderUserList(array) {
  let rawHTML = ""
  array.forEach(item => {
    rawHTML += `
      <div class="col-sm-3 mb-3">
        <div class="card text-center border-success">
          <img src="${item.avatar}"
            class="card-img-top rounded-circle img-fluid user-image" alt="user avatar">
          <div class="card-body">
            <h6 class="card-title text-center">this is <span class="fs-4">${item.name}</span></h6>
            <p class="card-text text-center">from <span class="fw-semibold">${item.region}</span></p>
          </div>
          <div class="card-footer">
            <button type="button" class="btn btn-info btn-show-modal" data-bs-toggle="modal" data-bs-target="#user-modal" data-id="${item.id}">Profile</button>
            <button type="button" class="btn btn-danger btn-remove-friend" data-id="${item.id}">Remove Friend</button>
          </div>
        </div>
      </div>
`
  })
  dataPanel.innerHTML = rawHTML
}

// 處理 UI顯示的 paginator
function renderPaginator(amount, currentPage) {
  const totalPages = Math.ceil(amount / USERS_PER_PAGE)

  let rawHTML = ""
  for (let page = 1; page <= totalPages; page++) {

    if (page === currentPage) {
      rawHTML += `
    <li class="page-item"><a class="page-link active" href="#" data-page=${page}>${page}</a></li>`
    } else {
      rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page=${page}>${page}</a></li>`
    }

  }
  paginator.innerHTML = rawHTML
}

// 處理 modal顯示的內容
function showUserModal(id) {

  const modalName = document.querySelector("#modal-user-name")
  const modalImg = document.querySelector("#modal-user-img")
  const modalRegion = document.querySelector("#modal-user-region")
  const modalGender = document.querySelector("#modal-user-gender")
  const modalAge = document.querySelector("#modal-user-age")
  const modalEmail = document.querySelector("#modal-user-email")

  axios.get(INDEX_URL + id)
    .then(response => {

      modalName.innerText = response.data.name + " " + response.data.surname
      modalImg.innerHTML = `<img src="${response.data.avatar}" alt="user avatar" class="img-fluid rounded">`
      modalRegion.innerText = 'from: ' + response.data.region
      modalGender.innerText = 'gender: ' + response.data.gender
      modalAge.innerText = 'age: ' + response.data.age
      modalEmail.innerText = 'email: ' + response.data.email
    })
}

// 處理 remove friend後，更新 localStorage資料，更新 UI顯示的 user list, paginator
function removeFromFriend(id) {
  if (!users || !users.length) return

  const friendIndex = users.findIndex(user => user.id === id)
  if (friendIndex === -1) return
  users.splice(friendIndex, 1)
  localStorage.setItem("Friends", JSON.stringify(users))


  const data = filteredUsers.length ? filteredUsers : users
  const currentIndex = data.findIndex(user => user.id === id)
  filteredUsers.splice(currentIndex, 1)

  const currentPage = Math.ceil((friendIndex + 1) / USERS_PER_PAGE)

  renderUserList(getUsersByPage(1))
  renderPaginator(users.length, currentPage)

}

// 處理每頁會看到的 users
function getUsersByPage(page) {
  const array = filteredUsers.length ? filteredUsers : users
  const startIndex = (page - 1) * USERS_PER_PAGE
  console.log(array)
  return array.slice(startIndex, startIndex + USERS_PER_PAGE)
}

// 監聽器 for Profile按鈕點擊 --> 點擊後 invoke相關函式
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-modal")) {
    showUserModal(Number(event.target.dataset.id))
  } else if (event.target.matches(".btn-remove-friend")) {
    removeFromFriend(Number(event.target.dataset.id))
  }
})

// 監聽器 for Search form Submitted --> submit後 UI渲染符合 keyword的 user清單
searchForm.addEventListener("submit", function searchFormSubmitted(event) {
  event.preventDefault()

  const keyword = searchInput.value.trim().toLowerCase()

  filteredUsers = users.filter(user => user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword))

  if (!filteredUsers.length) {
    return alert(`No results for ${keyword}`)
  }

  renderUserList(getUsersByPage(1))
  renderPaginator(filteredUsers.length)
})

// 監聽器 for 分頁點擊 --> 點擊後跳轉到對應 page的 users
paginator.addEventListener("click", function onPaginatorClicked(event) {

  if (event.target.tagName !== "A") return

  const page = Number(event.target.dataset.page)

  const data = filteredUsers.length ? filteredUsers : users
  renderUserList(getUsersByPage(page))
  renderPaginator(data.length, page)
})

renderUserList(getUsersByPage(1))
renderPaginator(users.length)
