# Server to Client Events
## List

- `joined`
- `waiting`
- `opened`
- `matched`
- `opened`

### `joined`

유저가 등록되었을 때 발생합니다. `token` 필드의 값은 본인일 때만 반환됩니다.

```json
{
  "event": "joined",
  "payload": {
    "nickname": "string",
    "token": "string?"
  }
}
```

### `waiting`

다른 유저들의 참여를 기다리고 있습니다. 준비를 누른 유저의 인원수가 갱신될 때마다 발생합니다.

```json
{
  "event": "progressed",
  "payload": {
    "readiedCount": 123
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

- `join`
- `rejoin`
- `ready`
- `open`
- `next`

### `join`

유저 정보를 등록합니다. `adminPassword` 필드의 값은 관리자만 포함해야합니다.

응답 이벤트 : `joined`, `progressed`

```json
{
  "event": "join",
  "payload": {
    "nickname": "string",
    "present": "string",
    "adminPassword": "string?"
  }
}
```

### `rejoin`

이전에 join한 토큰을 바탕으로 재접속합니다.

응답 이벤트 : `waiting`(아직 공개가 시작되지 않은 경우) 혹은 `matched`(마지막으로 매칭된 선물)

```json
{
  "event": "rejoin",
  "payload": {
    "token": "string"
  }
}
```

### `ready`

선물을 확인할 준비가 되었음을 나타냅니다.

응답 이벤트 : `wating`(아직 준비하지 않은 유저가 있는 경우) 혹은 `matched`(모두가 준비 된 경우)

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
