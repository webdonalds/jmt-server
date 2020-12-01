# Server to Client Events
## List

- `connected`
- `left`
- `waiting`
- `matched`
- `opened`
- `opened`

### `connected`

신규 유저가 등록되었을 때 발생합니다.

```json
{
  "event": "connected",
  "payload": {
    "token": "string"
  }
}
```

### `left`

유저가 떠났을 때 발생합니다.

```json
{
  "event": "left",
  "payload": {
    "nickname": "string"
  }
}
```

### `waiting`

다른 유저들의 참여를 기다리고 있습니다. 준비를 누른 유저의 인원수가 갱신될 때마다 발생합니다.

```json
{
  "event": "progressed",
  "payload": {
    "users": ["string"],
    "readiedUsers": ["string"]
  }
}
```

### `matched`

선물이 매칭되었을 때 발생합니다. 본인의 선물인 경우 `isMine` 필드의 값이 `true`로 반환됩니다.

```json
{
  "event": "matched",
  "payload": {
    "giverNickname": "string",
    "takerNickname": "string",
    "isMine": true
  }
}
```

### `opened`

선물이 공개되었을 때 발생합니다.

```json
{
  "event": "opened",
  "payload": {
    "giverNickname": "string",
    "takerNickname": "string",
    "present": "string"
  }
}
```

### `finished`

매칭 및 공개가 모두 완료되었을 때 발생합니다.

```json
{
  "event": "finished"
}
```

# Client to Server Events
## List

- `connect`
- `register`
- `ready`
- `open`
- `next`

### `connect`

소켓을 등록합니다. 재접속일 경우 `token` 값을 넣어서 요청해야합니다.

```json
{
  "event": "connect",
  "payload": {
    "token": "string?"
  }
}
```

### `register`

선물 정보를 등록합니다.

응답 이벤트 : `waiting` 혹은 `matched` 혹은 `opened` 혹은 `finished`

```json
{
  "event": "join",
  "payload": {
    "nickname": "string",
    "present": "string"
  }
}
```

### `ready`

선물을 확인할 준비가 되었음을 나타냅니다.

응답 이벤트 : `waiting`(아직 준비하지 않은 유저가 있는 경우) 혹은 `matched`(모두가 준비 된 경우)

```json
{
  "event": "ready"
}
```

### `open`

매칭된 선물을 공개합니다. 본인의 선물이 매칭된 차례에만 이벤트를 요청해야합니다.

응답 이벤트 : `opened`

```json
{
  "event": "open"
}
```

### `next`

다음 매칭을 진행합니다. 본인의 선물이 매칭, 공개된 차례에만 이벤트를 요청해야합니다.

응답 이벤트 : `matched`

```json
{
  "event": "next"
}
```
