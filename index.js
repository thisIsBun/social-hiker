const BASE_URL = "https://lighthouse-user-api.herokuapp.com/";
const INDEX_URL = BASE_URL + "api/v1/users/";

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form")
const searchInput = document.querySelector("#search-input")
const paginator = document.querySelector("#paginator")

const users = []
const USERS_PER_PAGE = 24
let filteredUsers = []
const friendsList = JSON.parse(localStorage.getItem("Friends")) || []

axios.get(INDEX_URL)
  .then(response => {
    users.push(...response.data.results)
    renderPaginator(users.length, 1)
    renderUserList(getUsersByPage(1))
  })
  .catch(error => console.log(error))


// 處理 UI顯示的 user list
function renderUserList(array) {
  let rawHTML = ""
  array.forEach(item => {

    if (friendsList.some(friend => friend.id === item.id)) {
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
            <button type="button" class="btn btn-info" data-bs-toggle="modal" data-bs-target="#user-modal" data-id="${item.id}">Profile</button>
            <button type="button" class="btn btn-secondary" data-id="${item.id}">Friend</button>
          </div>
        </div>
      </div>
`
    } else {
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
            <button type="button" class="btn btn-info" data-bs-toggle="modal" data-bs-target="#user-modal" data-id="${item.id}">Profile</button>
            <button type="button" class="btn btn-primary" data-id="${item.id}">Add Friend</button>
          </div>
        </div>
      </div>
`
    }
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

// add Friend時，處理 localStorage資料
function addToFriend(id) {
  const addFriend = users.find(user => user.id === id)

  const doubleAdd = friendsList.find(friend => friend.id === id)
  if (doubleAdd) return

  friendsList.push(addFriend)
  localStorage.setItem("Friends", JSON.stringify(friendsList))
}

// un-Friend時，處理 localStorage資料
function removeFromFriend(id) {
  const friendIndex = friendsList.findIndex(user => user.id === id)
  friendsList.splice(friendIndex, 1)
  localStorage.setItem("Friends", JSON.stringify(friendsList))
}

// 處理每頁會看到的 users
function getUsersByPage(page) {

  const array = filteredUsers.length ? filteredUsers : users
  const startIndex = (page - 1) * USERS_PER_PAGE
  return array.slice(startIndex, startIndex + USERS_PER_PAGE)
}


// 監聽器 for Profile按鈕點擊 --> 點擊後 invoke相關函式
dataPanel.addEventListener("click", function onPanelClicked(event) {

  if (event.target.matches(".btn-info")) {
    showUserModal(Number(event.target.dataset.id))
  } else if (event.target.matches(".btn-primary")) {
    addToFriend(Number(event.target.dataset.id))
    event.target.className = "btn btn-secondary"
    event.target.innerText = "Friend"
  } else if (event.target.matches(".btn-secondary")) {
    removeFromFriend(Number(event.target.dataset.id))
    event.target.className = "btn btn-primary"
    event.target.innerText = "Add Friend"
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
  console.log(filteredUsers.length)

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
