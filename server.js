const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs');

app.use('/public', express.static('public')); // 나는 static 파일을 보관하기 위해 public 폴더를 쓸거다

var db;
MongoClient.connect(
  'mongodb+srv://admin:qwer1234@cluster0.wzbqdrq.mongodb.net/?retryWrites=true&w=majority',
  function (에러, client) {
    if (에러) return console.log(에러);

    db = client.db('todoapp');

    app.listen(8080, function () {
      console.log('listening on 8080');
    });
  }
);

// 누군가가 /pet 으로 방문을 하면..
// pet 관련된 안내문을 띄워주자

app.get('/pet', function (요청, 응답) {
  응답.send('펫용품 쇼핑할 수 있는 페이지 입니다');
});

app.get('/beauty', function (요청, 응답) {
  응답.send('뷰티용품 쇼핑할 수 있는 페이지 입니다');
});

app.get('/write', function (요청, 응답) {
  응답.render('write.ejs');
});

// 어떤 사람이 /add 경로로 POST 요청을 하면...
// 데이터 2개(날짜, 제목)을 보내주는데,
// 이때 'post'라는 이름을 가진 collection에 두개 데이터를 저장해주세요~
// {제목 : '어쩌구', 날짜 : '어쩌구'}

// 누가 폼에서 /add로 POST 요청하면(요청.body에 게시물 데이터 담겨옴)
app.post('/add', function (요청, 응답) {
  응답.send('전송완료');
  // DB.counter 내의 총게시물갯수를 찾음
  db.collection('counter').findOne(
    { name: '게시물갯수' },
    function (에러, 결과) {
      console.log(결과.totalPost);
      // 총게시물갯수를 변수에 저장
      var 총게시물갯수 = 결과.totalPost;
      // 이제 DB.post에 새 게시물을 기록함
      db.collection('post').insertOne(
        { _id: 총게시물갯수 + 1, 제목: 요청.body.title, 날짜: 요청.body.date },
        function (에러, 결과) {
          console.log('저장완료');
          // 완료되면 DB.counter내의 총게시물 갯수 + 1  => 콜백함수로 만들기
          db.collection('counter').updateOne(
            { name: '게시물갯수' },
            { $inc: { totalPost: 1 } },
            function (에러, 결과) {
              if (에러) {
                return console.log(에러);
              }
            }
          ); // function은 없어도 됨
        }
      );
    }
  );
});

app.get('/', function (요청, 응답) {
  응답.render('index.ejs');
});

// /list로 GET요청으로 접속하면
// 실제 DB에 저장된 데이터들로 예쁘게 꾸며진 .ejs파일을 보여줌

app.get('/list', function (요청, 응답) {
  db.collection('post')
    .find()
    .toArray(function (에러, 결과) {
      console.log(결과);
      응답.render('list.ejs', { posts: 결과 });
    });

  // 디비에 저장된 post라는 collection안의 모든 데이터를 꺼내주세요
});

app.delete('/delete', function (요청, 응답) {
  console.log(요청.body);
  요청.body._id = parseInt(요청.body._id);
  // 요청.body에 담겨온 게시물 번호를 가진 글 목록을 삭제
  db.collection('post').deleteOne(요청.body, function (에러, 결과) {
    // delete성공하면 function실행해주세요
    console.log('삭제완료');
    응답.status(200).send({ messege: '성공했습니다' }); //응답 코드 200(성공) 400(실패) 500(서버문제) 을 보여주세요
  });
});

// '/delete/글번호'로 접속하면 detail.ejs 보여줌
app.get('/detail/:id', function (요청, 응답) {
  db.collection('post').findOne(
    { _id: parseInt(요청.params.id) },
    function (에러, 결과) {
      console.log(결과);
      응답.render('detail.ejs', { data: 결과 }); //ejs파일로 데이터를 보내는 방법
    }
  );
});
